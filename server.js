require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const enforce = require('express-sslify');
const minifyHtml = require('express-minify-html');
const cors = require('cors');

// The modules
const get = require('./modules/get');
const api = require('./modules/api');
const templateEngine = require('./modules/template-engine');

const app = express();

app.set('view engine', 'ejs')
    .set('views', 'views')
    // TODO: make it work on 'build' instead of 'public'
    .use(express.static('public'))
    .use(cors({credentials: true, origin: true}))
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
const redirectUrlLocal = 'http://localhost:8000';

http.createServer(app).listen(port, () => {
    console.log("Server is listening on port", port);
});

app.get('/offline', (req, res) => {
    res.render('offline');
});

const SpotifyWebApi = require('spotify-web-api-node');
const getters = require("./modules/getters");

// credentials are optional

var scopes = ['user-read-private', 'user-read-email'],
    redirectUri = 'https://example.com/callback',
    clientId = '5fe01282e44241328a84e7c5cc169165',
    state = 'some-state-of-my-choice';

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    //TODO: remove local!!!!
    redirectUri: encodeURIComponent(redirectUrlLocal)
});


// Used to atuhorize user by logging in to their spotify account
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email';
    const url = 'https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + CLIENT_ID +
        (scopes ? '&scope=' + encodeURIComponent(scope) : '') +
        '&redirect_uri=' + encodeURIComponent(redirectUrlLocal)

    getters.getToken().then(token => {
        console.log("token", token);

        spotifyApi.setAccessToken(token);

// Retrieve an access token and a refresh token
        spotifyApi.authorizationCodeGrant('MQCbtKe23z7YzzS44KzZzZgjQa621hgSzHN').then(
            function (data) {
                console.log('The token expires in ' + data.body['expires_in']);
                console.log('The access token is ' + data.body['access_token']);
                console.log('The refresh token is ' + data.body['refresh_token']);

                // Set the access token on the API object to use it in later calls
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
            },
            function (err) {
                console.log('Something went wrong!', err);
            }
        );

    });
})

    // Used to atuhorize user by logging in to their spotify account
    // app.get('/login', (req, res) => {
    //         console.log("called /login")
    //         // get.getLoginOAuth().then(data => {
    //         //     console.log("getLoginOAuth data", data);
    //         // })
    //         // const scopes = 'playlist-modify-private';
    //         const scopes = 'user-read-private user-read-email';
    //         res.setHeader('Access-Control-Allow-Origin', 'https://accounts.spotify.com/');
    //         res.redirect('https://accounts.spotify.com/authorize' +
    //             '?response_type=code' +
    //             '&client_id=' + CLIENT_ID +
    //             (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    //             '&redirect_uri=' + encodeURIComponent(redirectUrlLocal));
    //             // '&redirect_uri=' + encodeURIComponent(redirectUrl));
    //     });

    app.get('/:artistId', (req, res) => {
        const artistId = req.params.artistId;

        console.log("get: /:artistId", artistId)

        if (isString(artistId)) {
            get.getMostPopularTracks(artistId).then(tracksResult => {
                // res.send(data);
                res.render('index.ejs', {searchResult: '', tracksResult: tracksResult});
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

    app.post(['/', '/artistId'], (req, res) => {
        const inputText = req.body.inputText;
        const artistId = req.body.artistId;

        console.log("Post: ['/', '/artistId']. inputText:", inputText)
        console.log("Post: ['/', '/artistId']. artistId:", artistId)

        if (isString(inputText)) {
            // TODO: let ejs make template, not custom template. don't use a funciton for this
            getArtistResultHtml(req, res, inputText).then(resultHtml => {
                res.send(resultHtml);
            })
        } else if (isString(artistId)) {
            get.getMostPopularTracks(artistId).then(mostPopularTracks => {
                res.send(mostPopularTracks);
            })
        } else {
            res.send('');
        }
    })

    app.get('/', (req, res) => {
        const url = req.headers.referer;
        const inputText = req.query.q
        let artistId

        if (url) {
            const match = url.match('#([^&]+)');
            artistId = match ? match[1] : null;
        }

        const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

        console.log("Get /:", inputText, artistId);

        try {
            if (isString(inputText)) {
                getArtistResultHtml(req, res, inputText).then(searchResult => {

                    // If the artistId is also present, fetch this
                    if (isString(artistId)) {
                        get.getMostPopularTracks(artistId).then(mostPopularTracks => {
                            return {searchResult: searchResult, tracksResult: mostPopularTracks}
                        })
                    } else {
                        return {searchResult: searchResult, tracksResult: ''}
                    }
                }).then(results => {
                    console.log("Get results 1")
                    res.render('index.ejs', results);
                })
            } else if (isString(artistId)) {
                get.getMostPopularTracks(artistId).then(mostPopularTracks => {

                    // If the artistId is also present, fetch this
                    if (isString(artistId)) {
                        getArtistResultHtml(req, res, inputText).then(searchResult => {
                            return {searchResult: searchResult, tracksResult: mostPopularTracks}
                        })
                    } else {
                        return {searchResult: '', tracksResult: mostPopularTracks}
                    }
                }).then(results => {
                    console.log("Get results 2")
                    res.render('index.ejs', results);
                })
            } else {
                res.render('index.ejs', {searchResult: '', tracksResult: ''});
            }
        } catch (e) {
            res.status(500);
            res.send(error);
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