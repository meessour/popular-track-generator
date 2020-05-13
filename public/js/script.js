import * as userFeedback from "/js/user_feedback.js";

// Remember the not yet fired install prompt
let deferredPrompt;
// Track if the user is/was offline
let isOffline = false

// Only show connect Spotify button when JS is available
showConnectSpotifyButton();

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
    // Init START
    const artistId = window.location.hash.substring(1);

    if (artistId) {
        lookupArtist(artistId);
    }
    // Init END

    // When the hash (/#) changes of the page (a new artist has been selected)
    $(window).on('hashchange', function (e) {
        const artistId = window.location.hash.substring(1);

        lookupArtist(artistId);
    });

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

        console.log("User clikced authorize");

        $.get(window.location.origin + "/login", (data) => {
            console.log("success login!");
            // $("#most-popular-tracks").html(data);
            // userFeedback.stopLoadingFeedback(`Showing most popular tracks for artist`, "", false);
        }).fail(function (error) {
            console.log("Cannot authorize user", error);
            userFeedback.setUserFeedback(`Cannot authorize`, error.statusText, true);

        }).catch(function (error) {
            console.log("Cannot authorize user", error);
            userFeedback.setUserFeedback(`Cannot authorize`, error.statusText, true);
        });
    });

    $("#artist-search-input").on("input", function () {
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

                $.post(window.location.href, {inputText: inputText}, (data) => {
                    console.log("Get request response")

                    $("#search-result").removeClass("hidden");
                    $("#search-result").html(data);
                }).fail(function (error) {
                    console.log("Error fail", error);
                }).catch(function (error) {
                    console.log("Error", error);
                });
            } else {
                clearEverything();
            }
        }
    });
});

function lookupArtist(artistId) {
    if (artistId && artistId.length) {
        if (!navigator.onLine) {
            showOfflineMessage();
        } else {
            userFeedback.startLoadingFeedback();
            clearEverything();
            $.get(window.location.origin + "/artistId", {artistId: artistId}, (data) => {
                $("#most-popular-tracks").html(data);
                userFeedback.stopLoadingFeedback(`Showing most popular tracks for artist`, "", false);
            }).fail(function (error) {
                userFeedback.stopLoadingFeedback(`error on looking up artist`, error, true);
            }).catch(function (error) {
                userFeedback.stopLoadingFeedback(`error on looking up artist`, error, true);
            });
        }
    }
}

function isString(value) {
    return value && value !== "" && value.length > 0 && value.trim().length > 0;
}

function showOfflineMessage() {
    userFeedback.setUserFeedback("Offline", "You are not connected to the internet!", true);
}

function showOnlineMessage() {
    userFeedback.setUserFeedback("Online", "Welcome back!", false);
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

function clearEverything() {
    clearSearchBar();
    clearTrackResults();
    clearSearchResults();
}

function clearSearchBar() {
    $("#artist-search-input").val("");
}

function clearSearchResults() {
    $("#search-result").addClass("hidden");
    $("#search-result").empty();
}

function clearTrackResults() {
    $("#most-popular-tracks").empty();
}