import * as TemplateEngine from './modules/template-engine.js';
import * as Api from './modules/api.js';
import * as Getters from './modules/getters.js';
import * as Setters from './modules/setters.js';

// Routie, a routing library
import './libraries/routie.min.js';

const artistsNameInput = document.getElementById("artist-name-input");
const searchResult = document.getElementById("search-result");

artistsNameInput.addEventListener("input", function () {
    const input = artistsNameInput.value;

    // Check if input is not empty
    if (isString(input)) {
        searchArtistInput(input);
    } else {
        clearSearchBar();
        clearSearchResults();
    }
});

// check if value is a valid string with content
function isString(value) {
    return value && value !== "" && value.length > 0 && value.trim().length > 0;
}

routie(':id', function (id) {
    Setters.setMostPopularTracks(id);
    clearSearchBar();
    clearSearchResults();
});

async function searchArtistInput(input) {
    try {
        const token = await Getters.getToken();
        if (!token)
            throw "Token could not be set";

        // Fetch the artists from the API
        const artists = await Api.fetchArtists(input, token);
        if (!artists)
            throw "Artist's could not be loaded";

        // Fill in and get the template with the search results
        const searchResultsHtml = TemplateEngine.getArtistSearchResultsTemplate(artists);

        if (!searchResultsHtml) {
            clearSearchResults();
            throw "Artist's could not be loaded";
        }

        // Fill the options in the list with results
        searchResult.innerHTML = searchResultsHtml;
    } catch (error) {
        Setters.setUserFeedback(error);
    }
}

function clearSearchBar() {
    artistsNameInput.value = "";
}

function clearSearchResults() {
    searchResult.innerHTML = "";
}