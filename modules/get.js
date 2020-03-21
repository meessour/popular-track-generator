const api = require('./api.js');
const parser = require('./parser.js');
const getters = require('./getters.js');
const templateEngine = require('./template-engine.js');

module.exports = {
    getMostPopularTracks: async function (artistId) {
        // The amount that spotify allows to fetch in one time for albums
        const albumsWithTrackInfoCallLimit = 20;
        const albumsWithTrackInfoCallType = "albums";

        // The amount that spotify allows to fetch in one time for tracks
        const fullInfoTracksCallLimit = 50;
        const fullInfoTracksCallType = "tracks";

        return new Promise(async function (resolve, reject) {
            try {
                // No artistId was given. This means there can not be searched for an artist
                if (!artistId)
                    throw "Could not search tracks for artist";

                // Show the snackbar notification with the progress
                // userFeedback.startLoadingFeedback();

                const token = await getters.getToken();

                // userFeedback.setLoadingFeedbackTitle("Fetching artist");
                // userFeedback.setLoadingFeedbackText("");

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

                const tracksHtml = templateEngine.getMostPopularTracksTemplate(parsedFullInfoTracks);

                resolve(tracksHtml);
            } catch (error) {
                reject(error);
            }
        });
    }
};