const getters = require("./getters.js");
const setters = require("../public/js/setters.js");
const userFeedback = require("../public/js/user_feedback.js");
const changeUi = require("./server-modules/change-ui.mjs");

// Routie, a routing library
import './libraries/routie.min.js';

const artistsNameInput = document.getElementById("artist-name-input");

artistsNameInput.addEventListener("input", function () {
    const input = artistsNameInput.value;

    // Check if input is not empty
    if (isString(input)) {
        try {
            const token = await getters.getToken();

            const artist = await getters.getArtistSearchResults(input, token);

            setters.setArtistSearchResults(artist);
        } catch (error) {
            // userFeedback.setUserFeedback(error);

            changeUi.clearSearchBar();
            changeUi.clearSearchResults();
        }
    } else {
        changeUi.clearSearchBar();
        changeUi.clearTrackResults();
        changeUi.clearSearchResults();
    }
});

// check if value is a valid string with content
function isString(value) {
    return value && value !== "" && value.length > 0 && value.trim().length > 0;
}

routie(':id', function (id) {
    try {
        changeUi.clearSearchBar();
        changeUi.clearTrackResults();
        changeUi.clearSearchResults();

        // Get a list of all the most popular tracks
        const mostPopularTracks = await getters.getMostPopularTracks(id);

        // Set the list in the front end
        setters.setMostPopularTracks(mostPopularTracks);

        // Inform the user that everything went successful and how many tracks were set
        // userFeedback.stopLoadingFeedback(`Showing most popular tracks for: ${artist}`, `${tracks.length} tracks loaded`, false);
    } catch (error) {
        console.log("error:", error);
        // userFeedback.stopLoadingFeedback(error, "", true);
    }
});