
function getArtistSearchResultsTemplate(artists) {
    if (!Array.isArray(artists)) return;

    let html = "";

    artists.map(artist => html +=
        `<a class="artist-item" href=#${artist.id}>
            <img class="artist-picture" src=${artist.images[0] ? artist.images[(artist.images.length - 1)].url : ""} />
            <div class="artist-description">
                <p class="artist-name">${artist.name}</p>
                <div class="followers">
                    <i class="material-icons artist-result-icon">group</i>
                    <p class="artist-followers">${formatNumber(artist.followers.total)}</p>
                </div>
            </div>
        </a>`
    );

    return html;
}

function getMostPopularTracksTemplate(tracks) {
    if (!Array.isArray(tracks)) return;

    let html = "";

    tracks.map((track, index) => html +=
        `
        <div class="track-container">
            <div class="track-item" >
                <p class="track-list-position">${(index + 1)}</p>
                <img class="track-picture" src=${track.album && track.album.images[0] ? track.album.images[(track.album.images.length - 1)].url : ""} />
                <div class="track-description">
                    <p class="track-name">${track.name}</p>
                </div>
            </div>
            <div class="track-actions-container"> 
                <a class="track-action" onclick='console.log(${JSON.stringify(track)})'> 
                    <i class="material-icons track-action-icon">print</i>
                </a>
                <a class="track-action" href=${track.external_urls.spotify} target="_blank"> 
                    <i class="material-icons track-action-icon">launch</i>
                </a>
            </div>
        </div>
        `
    );

    return html;
}

// Used to add decimal points (dots) between every third number of a number
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

export { getArtistSearchResultsTemplate, getMostPopularTracksTemplate };