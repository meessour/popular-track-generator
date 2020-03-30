function getArtistSearchResultsTemplate(artists) {
    if (!Array.isArray(artists)) return;

    let html = "";

    for (let i = 0; i < artists.length; i++) {
        const artist = artists[i]
        html +=
            `<a class="artist-item" href=#${artist.id}>`;

        // Determine if a artist has a image. If not show a placeholder
        if (artist.images[0] && artist.images[0].url.length > 1) {
            html += `<img alt="Profile picture of the artist: ${artist.name}" class="artist-picture" src=${artist.images[(artist.images.length - 1)].url} />`;
        } else {
            html += `<img alt="A placeholder image for the artist profile picture" class="artist-picture-placeholder" src="/icons/account_box-24px.svg">`;
        }

        html +=
            `
<div class="artist-description">
<h4 class="artist-name">${artist.name}</h4>
<div class="followers">
<img alt="People in a group icon" class="artist-result-icon" src="/icons/group-24px.svg">
<p class="artist-followers">${formatNumber(artist.followers.total)}</p>
</div> 
</div>
</a>`;
    }

    return minifyHtml(html);
}

function getMostPopularTracksTemplate(tracks) {
    if (!Array.isArray(tracks)) return;

    /* Used to set an equal width for all the numbers width a set amount of characters */
    let characterWidthClass

    let html = "";

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];

        if (i >= 999) {
            characterWidthClass = "character-width-4";
        } else if (i >= 99) {
            characterWidthClass = "character-width-3";
        } else if (i >= 9) {
            characterWidthClass = "character-width-2";
        } else {
            characterWidthClass = "character-width-1";
        }

        html +=
            `
<div class="track-container">
<div class="track-item" >
<h4 class="track-list-position ${(characterWidthClass)}">${(i + 1)}</h4>
<img alt="Song/album cover related to the song: ${track.name}" class="track-picture" src=${track.album && track.album.images[0] ? track.album.images[(track.album.images.length - 1)].url : ""} />
<div class="track-description">
<p class="track-name">${track.name}</p>
</div>
</div>`

        html +=
            `
<a class="track-action" href=${track.external_urls.spotify} target="_blank" rel="noopener">
<img alt="Redirect to spotify in order to view the song" class="track-action-icon" src="/icons/launch-24px.svg">
</a>
</div>`;
    }

    return minifyHtml(html);
}

// Used to add decimal points (dots) between every third number of a number
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

// Used to minify the HTML. This way the file is less large
function minifyHtml(html) {
    return html.replace(/(\r\n|\n|\r)/gm, '');
}

module.exports = {getArtistSearchResultsTemplate, getMostPopularTracksTemplate};