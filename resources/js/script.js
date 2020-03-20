const artistsNameInput = document.getElementById("artist-name-input");
const searchResult = document.getElementById("search-result");
const mostPopularTracks = document.getElementById("most-popular-tracks");

$(() => {
    $('#artist-name-input').on("input", function() {
        const inputText = $("#artist-name-input").val();

        console.log("value:", inputText);

        // Check if input is not empty
        if (isString(inputText)) {
            $.post('http://localhost:8080/artistSearch', {"inputText": inputText});
        } else {
            clearSearchBar();
            clearTrackResults();
            clearSearchResults();
        }
    });
});

// check if value is a valid string with content
function isString(value) {
    return value && value !== "" && value.length > 0 && value.trim().length > 0;
}

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