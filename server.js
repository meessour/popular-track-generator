require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const enforce = require('express-sslify');
const minifyHtml = require('express-minify-html');

// The modules
const get = require('./modules/get');
const api = require('./modules/api');
const templateEngine = require('./modules/template-engine');

const app = express();

app.set('view engine', 'ejs')
    .set('views', 'views')
    // TODO: make it work on 'build' instead of 'public'
    .use(express.static('public'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))
    .use(minifyHtml({
        override: true,
        exception_url: false,
        htmlMinifier: {
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true,
            minifyJS: true
        }
    }))
;

// Enforce https when on Heroku
if (app.get("env") === "production") {
    app.use(enforce.HTTPS({trustProtoHeader: true}));
}

const port = process.env.PORT || 8000;
const CLIENT_ID = process.env.CLIENT_ID;
const redirectUrl = 'https://popular-track-generator.herokuapp.com';

http.createServer(app).listen(port, () => {
    console.log("Server is listening on port", port);
});

app.get('/offline', (req, res) => {
    res.render('offline');
});

app.get('/login', (req, res) => {
    // get.getLoginOAuth().then(data => {
    //     console.log("getLoginOAuth data", data);
    // })
    const scopes = 'playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + CLIENT_ID +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirectUrl));
});

app.get('/artistId', (req, res) => {
    const artistId = req.query.artistId;

    if (isString(artistId)) {
        get.getMostPopularTracks(artistId).then(data => {
            res.send(data);
        }).catch(error => {
            console.log("iets ging mis:", error);

            res.status(500);
            res.send("No ID given");

            // res.render('error artistId', {error: error});
        });
    } else {
        res.send("No ID given");
    }
});

app.post('/', (req, res) => {
    const inputText = req.body.inputText;

    console.log("Post:", inputText)

    if (isString(inputText)) {
        // TODO: let ejs make template, not custom template. don't use a funciton for this
        getArtistResultHtml(req, res, inputText).then(resultHtml => {
            res.send(resultHtml);
        })
    } else {
        res.send('');
    }
})

app.get('/', (req, res) => {
    // const url = req.headers.referer;
    const tracksResult = ''
    const inputText = req.query.q

    console.log("Get", inputText);

    // if (url) {
    //     const match = url.match('[?&]q=([^&]+)');
    //     inputText = match ? match[1] : null;
    // }

    if (isString(inputText)) {
        getArtistResultHtml(req, res, inputText).then(resultHtml => {
            res.render('index.ejs', {searchResult: resultHtml, tracksResult: tracksResult});
        }).catch(error => {
            res.status(500);
            res.send(error);
        });
    } else {
        res.render('index.ejs', {searchResult: '', tracksResult: tracksResult});
    }
});

function getArtistResultHtml(req, res, inputText) {
    return api.fetchToken()
        .then(token => {
            if (token && token.access_token)
                return token.access_token;

            throw "No spotify access_token available";
        })
        .then(token => {
            return api.fetchArtists(inputText, token);
        })
        .then(artists => {
            return templateEngine.getArtistSearchResultsTemplate(artists);
        }).then(resultHtml => {
            return resultHtml;
        })
        .catch(error => {
            res.status(500);
            res.send(error);
        });
}

// Check if value is a valid string with content
function isString(value) {
    return value && value !== "" && value.length > 0 && value.trim().length > 0;
}