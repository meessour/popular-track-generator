const express = require('express');
const bodyParser = require('body-parser');

const get = require('./modules/get');
const api = require('./modules/api');
const parser = require('./modules/parser');
const templateEngine = require('./modules/template-engine');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

var server = app.listen(8080, () => {
    console.log("Server is listening on port", server.address().port);
});

app.get('/artistId', (req, res) => {
    const artistId = req.query.artistId;

    if (isString(artistId)) {
        get.getMostPopularTracks(artistId).then(data => {
            res.send(data);
        }).catch(error => {
            console.log("iets ging mis:", error);

            res.status(500)
            res.send("No ID given");

            // res.render('error artistId', {error: error});
        });
    } else {
        res.send("No ID given");
    }
});

app.get('/', (req, res) => {
    const inputText = req.query.inputText;
    const artistId = req.query.artistId;

    if (isString(inputText)) {

        api.fetchToken()
            .then(token => {
                if (token && token.access_token)
                    return token.access_token;

                throw "geen token";
            })
            .then(token => {
                let artists = api.fetchArtists(inputText, token);
                return artists;
            })
            .then(artists => {
                // return parser.parseArtistsData(artists);
                return templateEngine.getArtistSearchResultsTemplate(artists);
            }).then(artists => {
            res.send(artists);
        })
            .catch(error => {
                res.status(500)
                res.render('error', {error: error});
            });

    } else {
        res.render('index.ejs', {artists: [], tracks: []});
    }
})

// app.get('/#artist', (req, res) => {
//     var artist = req.params.artist
//     console.log("Artist:", artist);
//
// })

// check if value is a valid string with content
function isString(value) {
    return value && value !== "" && value.length > 0 && value.trim().length > 0;
}