import * as Api from './api.js';
import * as Parser from './parser.js';
import * as LocalStorage from './local-storage.js';
import * as Setters from './setters.js';

async function getAllAlbums(artistId, token) {
    try {
        // Fetch the albums of an artist
        const firstFetchResponse = await Api.fetchAlbumsByArtistId(token, artistId);
        if (!firstFetchResponse)
            throw "Spotify services didn't return anything";

        // The items represent the albums of the artist
        const allLoadedAlbums = firstFetchResponse.items;

        // Set the url needed to fetch more albums of the artist (it can be that all albums have been fetched already)
        let nextUrl = firstFetchResponse.next;

        if (!Array.isArray(allLoadedAlbums) && allLoadedAlbums.length)
            throw "Artist's albums could not be loaded";

        // Fetch more albums until the response doesn't return any anymore
        while (nextUrl) {
            const fetchResponse = await Api.fetchByUrl(token, nextUrl);
            if (!fetchResponse)
                throw "Spotify services didn't return anything";

            const albums = fetchResponse.items;
            nextUrl = fetchResponse.next;

            // Add the newly loaded in albums to the already existing list
            allLoadedAlbums.push.apply(allLoadedAlbums, albums);
        }

        return allLoadedAlbums;
    } catch (error) {
        Setters.setUserFeedback(error);
    }
}

// Used to fetch items where the API has a limit on items it can handle in the header
async function getItemsWithCallLimit(itemIds, limit, itemType, token) {
    try {
        // Check if the list has items 
        if (!Array.isArray(itemIds) || !itemIds.length)
            throw "No items were found";

        const allItems = [];

        // The amount of calls that need to be made 
        const amountOfCalls = Math.ceil(itemIds.length / limit);

        for (let i = 0; i < amountOfCalls; i++) {
            const start = i * limit;
            const end = (i * limit) + limit;

            // list containing not more than the given item limit
            const trimmedList = itemIds.slice(start, end);

            // A list containing ids seperated by commas
            const trimmedListString = trimmedList.toString();

            let fetchedItems = await Api.fetchItemsByItemIds(token, itemType, trimmedListString);
            if (!fetchedItems)
                throw "Items of type " + itemType + " could not be fetched";

            if (itemType === "albums") {
                allItems.push.apply(allItems, fetchedItems.albums);
            } else if (itemType === "tracks") {
                allItems.push.apply(allItems, fetchedItems.tracks);
            } else {
                throw "Unknown itemType";
            }
        }

        if (!Array.isArray(allItems) || !allItems.length)
            throw "No items were found";

        return allItems;
    } catch (error) {
        Setters.setUserFeedback(error);
        return;
    }
}

async function getToken() {
    // Get the token form the local storage
    const token = await LocalStorage.getTokenFromLocalStorage();

    // If a token was found in the local storage, return it
    if (token)
        return token;

    // Fetch the token
    const newTokenData = await Api.fetchToken();
    if (!newTokenData)
        throw "Could not fetch the token from Spotify";

    const parsedNewTokenData = Parser.parseTokenData(newTokenData);
    if (!parsedNewTokenData)
        throw "Could not parse the fetched token";

    const parsedNewToken = parsedNewTokenData.accessToken;
    const parsedNewTokenExpiration = parsedNewTokenData.expiresIn;

    if (!parsedNewToken || !parsedNewTokenExpiration)
        throw "Parsed token missed some data";

    LocalStorage.setTokenInLocalStorage(parsedNewToken, parsedNewTokenExpiration);

    return parsedNewToken;
}

export { getAllAlbums, getItemsWithCallLimit, getToken };