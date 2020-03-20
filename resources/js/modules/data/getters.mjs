const api = require("./api.mjs");
const parser = require("./parser.mjs");
const localStorage = require("./local-storage.mjs");
const userFeedback = require("../ui/user-feedback.mjs");

// The amount that spotify allows to fetch in one time for albums
const albumsWithTrackInfoCallLimit = 20;
const albumsWithTrackInfoCallType = "albums";

// The amount that spotify allows to fetch in one time for tracks
const fullInfoTracksCallLimit = 50;
const fullInfoTracksCallType = "tracks";

async function getArtistSearchResults(input, token) {
    // Fetch the artists from the API
    const artists = await api.fetchArtists(input, token);
    if (!artists)
        throw "Artists could not be fetched";

    return artists;
}

async function getAllAlbums(artistId, token) {
    userFeedback.setLoadingFeedbackTitle("Fetching albums");
    userFeedback.setLoadingFeedbackText("Fetching albums by artist's id");

    // Fetch the albums of an artist
    const firstFetchResponse = await api.fetchAlbumsByArtistId(token, artistId);
    if (!firstFetchResponse)
        throw "Spotify services didn't return anything";

    // The items represent the albums of the artist
    const allLoadedAlbums = firstFetchResponse.items;

    // Set the url needed to fetch more albums of the artist (it can be that all albums have been fetched already)
    let nextUrl = firstFetchResponse.next;

    if (!Array.isArray(allLoadedAlbums) && allLoadedAlbums.length)
        throw "Artist's albums could not be loaded";

    userFeedback.setLoadingFeedbackText(allLoadedAlbums.length + " Albums fetched");

    // Fetch more albums until the response doesn't return any anymore
    while (nextUrl) {
        const fetchResponse = await api.fetchByUrl(token, nextUrl);
        if (!fetchResponse)
            throw "Spotify services didn't return anything";

        const albums = fetchResponse.items;
        nextUrl = fetchResponse.next;

        // Add the newly loaded in albums to the already existing list
        allLoadedAlbums.push.apply(allLoadedAlbums, albums);
        userFeedback.setLoadingFeedbackText(allLoadedAlbums.length + " Albums fetched");
    }

    return allLoadedAlbums;
}

// Used to fetch items where the API has a limit on items it can handle in the header
async function getItemsWithCallLimit(itemIds, limit, itemType, token) {
    userFeedback.setLoadingFeedbackTitle("Fetching tracks");
    userFeedback.setLoadingFeedbackText("");

    // Check if the list has items 
    if (!Array.isArray(itemIds) || !itemIds.length)
        throw "No items were found";

    const allItems = [];

    // The amount of calls that need to be made 
    const amountOfCalls = Math.ceil(itemIds.length / limit);
    userFeedback.setLoadingFeedbackText("0% done. " + allItems.length + " items fetched");

    for (let i = 0; i < amountOfCalls; i++) {

        const start = i * limit;
        const end = (i * limit) + limit;

        // list containing not more than the given item limit
        const trimmedList = itemIds.slice(start, end);

        // A list containing ids seperated by commas
        const trimmedListString = trimmedList.toString();

        let fetchedItems = await api.fetchItemsByItemIds(token, itemType, trimmedListString);

        if (!fetchedItems)
            throw "Items of type " + itemType + " could not be fetched";

        if (itemType === "albums") {
            allItems.push.apply(allItems, fetchedItems.albums);
        } else if (itemType === "tracks") {
            allItems.push.apply(allItems, fetchedItems.tracks);
        } else {
            throw "Unknown itemType";
        }

        userFeedback.setLoadingFeedbackText(Math.round((((i + 1) / amountOfCalls) * 100)) + "% done. " + allItems.length + " items fetched");
    }

    if (!Array.isArray(allItems) || !allItems.length)
        throw "No items were found";

    return allItems;
}

async function getToken() {
    userFeedback.setLoadingFeedbackTitle("Getting token");
    userFeedback.setLoadingFeedbackText("");

    // Get the token form the local storage
    const token = await localStorage.getTokenFromLocalStorage();

    // If a token was found in the local storage, return it
    if (token)
        return token;

    userFeedback.setLoadingFeedbackText("Fetching a new token");
    // Fetch the token
    const newTokenData = await api.fetchToken();
    if (!newTokenData)
        throw "Could not fetch the token from Spotify";

    userFeedback.setLoadingFeedbackText("New token fetched");

    const parsedNewTokenData = parser.parseTokenData(newTokenData);
    if (!parsedNewTokenData)
        throw "Could not parse the fetched token";

    const parsedNewToken = parsedNewTokenData.accessToken;
    const parsedNewTokenExpiration = parsedNewTokenData.expiresIn;

    if (!parsedNewToken || !parsedNewTokenExpiration)
        throw "Parsed token missed some data";

    localStorage.setTokenInLocalStorage(parsedNewToken, parsedNewTokenExpiration);

    userFeedback.setLoadingFeedbackText("New token set");

    return parsedNewToken;
}

async function getMostPopularTracks(artistId) {
    // No artistId was given. This means there can not be searched for an artist
    if (!artistId)
        throw "Could not search tracks for artist";

    // Show the snackbar notification with the progress
    userFeedback.startLoadingFeedback();

    const token = await getters.getToken();

    userFeedback.setLoadingFeedbackTitle("Fetching artist");
    userFeedback.setLoadingFeedbackText("");

    // Fetch the artist's information
    const artist = await api.fetchArtistNameById(artistId, token);
    if (!artist)
        throw "Artist's information could not be loaded";

    // Fetch the albums
    let albums = await getters.getAllAlbums(artistId, token);

    let albumIds = parser.getAlbumIds(albums);

    // Fetch the albums with simplified track information
    const albumsWithTrackInfo = await getters.getItemsWithCallLimit(albumIds, albumsWithTrackInfoCallLimit, albumsWithTrackInfoCallType, token);

    const parsedAlbumsWithTrackInfo = parser.filterTracksFromAlbums(albumsWithTrackInfo);

    // Filter out the tracks not made by the artist
    const simplifiedTracksOnlyFromArtist = parser.filterRelevantTracks(parsedAlbumsWithTrackInfo, artistId);

    // Get a list of all the track ids
    const simplifiedTrackIds = parser.getTrackIds(simplifiedTracksOnlyFromArtist);
    // Fetch the tracks with detailed information
    const fullInfoTracks = await getters.getItemsWithCallLimit(simplifiedTrackIds, fullInfoTracksCallLimit, fullInfoTracksCallType, token);

    const sortedFullInfoTracksByPopularity = parser.sortTracksByPopularity(fullInfoTracks);

    const parsedFullInfoTracks = parser.filterDuplicateTracks(sortedFullInfoTracksByPopularity);

    return parsedFullInfoTracks;
}

module.exports = {
    getArtistSearchResults, getAllAlbums, getItemsWithCallLimit, getToken, getMostPopularTracks
};