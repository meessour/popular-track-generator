
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const getters = require("./resources/js/modules/data/getters.mjs");
const setters = require("./resources/js/modules/ui/setters.mjs");
const userFeedback = require("./resources/js/modules/ui/user-feedback.mjs");
const changeUi = require("./resources/js/modules/ui/change-ui.mjs");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

var server = app.listen(8080, () => {
    console.log("Server is listening on port", server.address().port);
});

// app.get('/:artistId', (req, res) => {
//     var artistId = req.params.artistId;

//     console.log("messagE:", artistId);


//     // Message.find({name: user}, (err, messages) => {
//     //     res.send(messages)
//     // })
// })

app.get('/artistSearch/', (req, res) => {
    console.log("Artist 1:");
    res.send("mmmmmmmmmmmmmmmmm")
})

app.get('/artistSearch/:artistId', (req, res) => {
    var artistId = req.params.artistId
    console.log("Artist:", artistId);
    res.send("kkkkkkkkkkkkkkkkkkk")

})

app.post('/artistSearch', async (req, res) => {
    try {
        const inputText = req.body.inputText;

        // const token = await getters.getToken();
        const token = getters.getToken();

        // const artist = await getters.getArtistSearchResults(inputText, token);
        const artist = getters.getArtistSearchResults(inputText, token);

        setters.setArtistSearchResults(artist);

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);

        userFeedback.setUserFeedback(error);

        // changeUi.clearSearchBar();
        // changeUi.clearSearchResults();
    }
});

// check if value is a valid string with content
function isString(value) {
    return value && value !== "" && value.length > 0 && value.trim().length > 0;
}