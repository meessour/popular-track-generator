const artistsNameInput = document.getElementById("artist-name-input");
const searchResult = document.getElementById("search-result");
const mostPopularTracks = document.getElementById("most-popular-tracks");

function clearSearchBar() {
    artistsNameInput.value = "";
}

function clearSearchResults() {
    searchResult.classList.add("hidden");
    searchResult.innerHTML = "";
}

function clearTrackResults() {
    mostPopularTracks.innerHTML = "";
}

module.exports = {
    clearSearchBar, clearSearchResults, clearTrackResults
};