import * as userFeedback from "/js/user_feedback.js";

// Remember the not yet fired install prompt
let deferredPrompt;
// Track if the user is/was offline
let isOffline = false

init();

function init() {
    // Only show connect Spotify button when JS is available
    showConnectSpotifyButton();

    setTrackItemsListeners();
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successful with scope: !', registration.scope);
                return registration.update();
            });
    });
}

window.addEventListener("beforeinstallprompt", function (e) {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
});

window.addEventListener('appinstalled', (evt) => {
    // Hide the app provided install promotion
    hideInstallPromotion();
});

// If the user is/goes offline
window.addEventListener('offline', (e) => {
    isOffline = true;
    showOfflineMessage();
});

window.addEventListener('online', (e) => {
    // Check if the user WAS offline
    if (isOffline) {
        showOnlineMessage();
        isOffline = false;
    }
});

$(() => {
    // TODO: Remove unnecessary Jquery
    // When the user clicks on the install button
    $("#install-app").on("click", function () {
        if (!deferredPrompt)
            return;

        showInstallPromotion();
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');

                // Hide the app provided install promotion
                hideInstallPromotion();
            } else {
                console.log('User dismissed the install prompt');
                showInstallPromotion();
            }
        });
    });

    $("#authorize").on("click", function () {
        console.log("User clicked authorize");

        $.get(window.location.origin + "/login", (data) => {
            console.log("success login!");
            // $("#most-popular-tracks").html(data);
        }).fail(function (error) {
            console.log("Cannot authorize user", error);
            userFeedback.setUserFeedback(`Cannot authorize`, error.statusText, 'error');

        }).catch(function (error) {
            console.log("Cannot authorize user", error);
            userFeedback.setUserFeedback(`Cannot authorize`, error.statusText, 'error');
        });
    });

    $("#artist-search-input").on("input", function () {
        // Remove the last query search as soon as the user searches with new input
        clearSearchUrl();

        if (!navigator.onLine) {
            showOfflineMessage();
        } else {
            const inputTextTarget = $("#artist-search-input");

            const inputText = inputTextTarget ? inputTextTarget.val() : undefined;

            // Check if input is not empty
            if (isString(inputText)) {
                // Get the current URL
                // let url = new URL(window.location.href);
                // url.searchParams.set('q', inputText);
                //
                // window.history.pushState({}, inputText, url);

                $.post(window.location.origin, {inputText: inputText}, (data) => {
                    console.log("Post artistId response success")

                    $("#search-result").removeClass("hidden");
                    $("#search-result").html(data);
                    setTrackItemsListeners();

                }).fail(function (error) {
                    console.log("Error fail", error);
                }).catch(function (error) {
                    console.log("Error", error);
                });
            } else {
                clearSearch();
            }
        }
    });
});

function setTrackItemsListeners() {
    console.log('Setting lsiteners', document.getElementById("search-result").querySelectorAll(".artist-item"))
    // Sets an event listener for every track item in the search result container
    document.getElementById("search-result").querySelectorAll(".artist-item").forEach(function (element) {
        element.addEventListener("click", function (e) {
            console.log("Item clicked", element)
            // Prevent going to the specified href
            e.preventDefault();

            // Get the href of the element (which contains teh artistId) and remove the /
            const artistId = element.getAttribute("href").replace("/", "");

            lookupArtist(artistId)
            // return false;
        });
    });
}

function lookupArtist(artistId) {
    if (artistId && artistId.length) {
        if (!navigator.onLine) {
            showOfflineMessage();
        } else {
            userFeedback.setUserFeedback("Fetching tracks...", "This can take up to 30 seconds", 'loading');

            clearSearch();

            $.post(window.location.origin + "/artistId/", {artistId: artistId}, (data) => {
                $("#most-popular-tracks").html(data);
                userFeedback.setUserFeedback('Tracks fetched', "Showing most popular tracks for artist", 'success');
            }).fail(function (error) {
                setUserFeedback(`Failed looking up artist`, error, 'error');
            }).catch(function (error) {
                userFeedback.setUserFeedback(`Error while looking up artist`, error, 'error');
            });
        }
    }
}

document.addEventListener("loadstart", callback => {
    console.log("loadstart document")
});

window.addEventListener("loadstart", callback => {
    console.log("loadstart window")
});

window.addEventListener("loaded", callback => {
    console.log("loaded")
});
window.addEventListener("interactive", callback => {
    console.log("interactive")
});

function isString(value) {
    return value && value !== "" && value.length > 0 && value.trim().length > 0;
}

function showOfflineMessage() {
    userFeedback.setUserFeedback("Offline", "You are not connected to the internet!", 'error');
}

function showOnlineMessage() {
    userFeedback.setUserFeedback("Online", "Welcome back!", 'success');
}

function showInstallPromotion() {
    $("#install-app").removeClass("hidden");
}

function showConnectSpotifyButton() {
    $("#authorize").removeClass("hidden");
}

function hideInstallPromotion() {
    $("#install-app").addClass("hidden");
}

function clearSearch() {
    console.log("clear Everytihng")
    // Clear the search input
    $("#artist-search-input").val("");

    // Clear/remove all search results
    $("#search-result").addClass("hidden");
    $("#search-result").empty();
}

function clearTrackResults() {
    // Remove all loaded tracks from its container
    $("#most-popular-tracks").empty();
}

function clearSearchUrl() {
    let url = new URL(window.location.href);
    url.searchParams.delete('q')

    window.history.pushState({}, '', url);
}