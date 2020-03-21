module.exports = {
    parseTokenData: function (tokenData) {
        if (tokenData && tokenData.access_token && tokenData.expires_in) {
            return {
                accessToken: tokenData.access_token,
                expiresIn: tokenData.expires_in
            };
        }
        console.log("One or more response items related to the token are undefined");

        return;
    },
    parseArtistsData: function (artists) {

        // Add decimals between the total amount of followers of an artist
        artists.map(artist =>
            artist.followers.total
                .toString()
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'));

        // Parse every object to a JSON
        // artists.map(artist =>
        //     JSON.parse(artist));
        //
        // const artistsJson = artists.toString()
        // const artistsJson2 = JSON.stringify(artistsJson)
        // const artistsJson3 = JSON.parse(artistsJson2)
        // console.log(typeof(artistsJson3));
        //
        // console.log("artistsartists:", artistsJson3)

        return artists;
        // return artistsJson;
    },

// Return all the ids of the albums
    getAlbumIds: function (albums) {
        const albumIds = [];

        for (let i = 0; i < albums.length; i++) {
            // Check if the album has an id
            if (albums[i] && albums[i].id) {
                albumIds.push(albums[i].id);
            }
        }

        if (albumIds.length < 1)
            throw "Error while filtering id's from albums";

        return albumIds;
    },

// Return all the ids of the tracks
    getTrackIds: function (tracks) {
        const trackIds = [];

        tracks.map((track) => {
            // Check if the track has an id
            if (track && track.id) {
                trackIds.push(track.id);
            }
        });

        if (trackIds.length < 1)
            throw "Error while filtering tracks id's";

        return trackIds;
    },

    filterTracksFromAlbums: function (albums) {
        const allTracks = [];

        albums.map((album) => {
            // Check if the album contains tracks
            if (album && album.tracks && album.tracks.items) {
                allTracks.push.apply(allTracks, album.tracks.items);
            }
        });

        if (allTracks.length < 1)
            throw "Error while filtering tracks from albums";

        // Only return the array when it contains one or more tracks
        return allTracks;
    },

// Only return the tracks of the artist searched for
    filterRelevantTracks: function (tracks, artistId) {
        const filteredTracks = [];

        tracks.map((track) => {
            // Check if the track is made by the artist
            if (track && Array.isArray(track.artists) &&
                track.artists.some(track => track.id === artistId)) {
                filteredTracks.push(track);
            }
        });

        if (filteredTracks.length < 1)
            throw "Error while filtering out irrelevant tracks";

        // Only return the array when it contains one or more tracks
        return filteredTracks;
    },

// Remove duplicate tracks from the list
    filterDuplicateTracks: function (tracks) {
        const filteredTracks = [];

        tracks.map((track) => {
            // Check if the track already exists in the filtered tracks array
            if (track.external_ids && track.external_ids.isrc &&
                !filteredTracks.some(filteredTrack => filteredTrack.external_ids.isrc === track.external_ids.isrc)) {

                filteredTracks.push(track);
            }
        });

        if (filteredTracks.length < 1)
            throw "Error while filtering duplicate tracks";

        // Only return the array when it contains one or more tracks
        return filteredTracks;
    },

    sortTracksByPopularity: function (tracks) {
        // From: https://stackoverflow.com/a/1129270
        return tracks.sort((a, b) => (a.popularity < b.popularity) ? 1 : ((b.popularity < a.popularity) ? -1 : 0));
    },
};