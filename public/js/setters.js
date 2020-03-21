const templateEngine = require('../../modules/template-engine.js');

const mostPopularTracks = document.getElementById("most-popular-tracks");
const searchResult = document.getElementById("search-result");

function setArtistSearchResults(artists) {
    // Fill in and get the template with the search results
    const searchResultsHtml = templateEngine.getArtistSearchResultsTemplate(artists);

    if (!searchResultsHtml)
        throw "Artist's could not be set";

    // Fill the options in the list with results
    searchResult.classList.remove("hidden");
    searchResult.innerHTML = searchResultsHtml;
}

function setMostPopularTracks(tracks) {
    // Fill in and get the template with the search results
    const tracksHtml = templateEngine.getMostPopularTracksTemplate(tracks);

    // Fill the options in the list with results
    // CHANGE TO INJECT
    mostPopularTracks.innerHTML = tracksHtml;
}

module.exports = {setArtistSearchResults, setMostPopularTracks};