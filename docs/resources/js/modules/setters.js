import * as TemplateEngine from './template-engine.js';
import * as Api from './api.js';
import * as Parser from './parser.js';
import * as Getters from './getters.js';

const mostPopularTracks = document.getElementById("most-popular-tracks");
const userFeedbackContainer = document.getElementById("user-feedback-container");
const userFeedbackText = document.getElementById("user-feedback-text");

async function setMostPopularTracks(artistId) {
    try {
        // No artistId was given. This means there can not be searched for an artist
        if (!artistId)
            throw "Could not search tracks for artist";

        const token = await Getters.getToken();

        if (!token)
            throw "Token could not be set";

        // Fetch the artist's information
        const artist = await Api.fetchArtistNameById(artistId, token);
        if (!artist)
            throw "Artist's information could not be loaded";

        // Fetch the albums
        let albums = await Getters.getAllAlbums(artistId, token);
        if (!albums)
            throw "Artist's albums could not be loaded";

        let albumIds = Parser.getAlbumIds(albums);
        if (!albumIds)
            throw "Albums Ids did not parse successfully";

        const albumsWithTrackInfoCallLimit = 20;
        const albumsWithTrackInfoCallType = "albums";

        // Fetch the albums with simplified track information
        const albumsWithTrackInfo = await Getters.getItemsWithCallLimit(albumIds, albumsWithTrackInfoCallLimit, albumsWithTrackInfoCallType, token);
        if (!albumsWithTrackInfo)
            throw "Artist's albums with detailed track info could not be loaded";

        const parsedAlbumsWithTrackInfo = Parser.filterTracksFromAlbums(albumsWithTrackInfo);
        if (!parsedAlbumsWithTrackInfo)
            throw "Albums with track info did not parse successfully";

        // Filter out the tracks not made by the artist
        const simplifiedTracksOnlyFromArtist = Parser.filterRelevantTracks(parsedAlbumsWithTrackInfo, artistId);
        if (!simplifiedTracksOnlyFromArtist)
            throw "Simplified track ids only from the artist did not parse successfully";

        // Get a list of all the track ids
        const simplifiedTrackIds = Parser.getTrackIds(simplifiedTracksOnlyFromArtist);
        if (!simplifiedTrackIds)
            throw "Simplified track ids did not parse successfully";

        const fullInfoTracksCallLimit = 50;
        const fullInfoTracksCallType = "tracks";

        // Fetch the tracks with detailed information
        const fullInfoTracks = await Getters.getItemsWithCallLimit(simplifiedTrackIds, fullInfoTracksCallLimit, fullInfoTracksCallType, token);
        if (!fullInfoTracks)
            throw "Artist's tracks with detailed track info could not be loaded";

        const sortedFullInfoTracksByPopularity = Parser.sortTracksByPopularity(fullInfoTracks);
        if (!sortedFullInfoTracksByPopularity)
            throw "Sorting tracks by popularity did not went successful";

        const parsedFullInfoTracks = Parser.filterDuplicateTracks(sortedFullInfoTracksByPopularity);
        if (!parsedFullInfoTracks)
            throw "Tracks with full info did not parse successfully";

        // Fill in and get the template with the search results
        const mostPopularTracksHtml = TemplateEngine.getMostPopularTracksTemplate(parsedFullInfoTracks);
        if (!mostPopularTracksHtml)
            throw "Could not load results in list";

        // setUserFeedback("Showing results for " + artist, false)
        setUserFeedback(`${sortedFullInfoTracksByPopularity.length} most popular tracks loaded for: ${artist}`, false);

        // Fill the options in the list with results
        mostPopularTracks.innerHTML = mostPopularTracksHtml;
    } catch (error) {
        setUserFeedback(error);
    }
}

// Show a snackbar looking feedback message. Standard message type is an error, unless told otherwise
function setUserFeedback(message, isError = true) {
    if (isError)
        console.error(message);

    // Set container color either the error or success color
    isError ?
        userFeedbackContainer.classList.add("error-color") :
        userFeedbackContainer.classList.add("success-color");

    // Set the user feedback
    userFeedbackText.innerHTML = message;

    // Show user feedback
    userFeedbackContainer.classList.add("show-user-feedback");

    // Show the feedback notification for 1.75 seconds
    setTimeout(function () {
        userFeedbackContainer.classList.remove("error-color");
        userFeedbackContainer.classList.remove("success-color");
        userFeedbackContainer.classList.remove("show-user-feedback");

        userFeedbackText.innerHTML = "";
    }, 1750);

}

export { setMostPopularTracks, setUserFeedback };