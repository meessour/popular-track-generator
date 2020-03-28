if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
                return registration.update();
            });
    });
}

// Remember the not yet fired install prompt
let deferredPrompt;

window.addEventListener("beforeinstallprompt", function (e) {
    console.log("Install????");
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
})

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



    $("#install-app").on("click", function () {
        // Hide the app provided install promotion
        hideInstallPromotion();
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
        })
    });

    $("#artist-name-input").on("input", function () {
        const inputTextTarget = $("#artist-name-input");

        const inputText = inputTextTarget ? inputTextTarget.val() : undefined;

        // Check if input is not empty
        if (isString(inputText)) {
            $.get(window.location.origin, {inputText: inputText}, (data) => {
                $("#search-result").removeClass("hidden");
                $("#search-result").html(data);
            }).fail(function (error) {
                console.log("error on searching artist search", error);
            });
        } else {
            clearSearchBar();
            clearTrackResults();
            clearSearchResults();
        }
    });

    function lookupArtist(artistId) {
        if (artistId && artistId.length) {

            $.get(window.location.origin + "/artistId", {artistId: artistId}, (data) => {

                clearSearchBar();
                // clearTrackResults();
                clearSearchResults();

                $("#most-popular-tracks").html(data);
            }).fail(function (error) {
                console.log("error on artistId look up", error);
            });
        }
    }

    function isString(value) {
        return value && value !== "" && value.length > 0 && value.trim().length > 0;
    }

    function showInstallPromotion() {
        $("#install-app").removeClass("hidden");
    }

    function hideInstallPromotion() {
        $("#install-app").addClass("hidden");
    }

    function clearSearchBar() {
        $("#artist-name-input").val("");
    }

    function clearSearchResults() {
        $("#search-result").addClass("hidden");
        $("#search-result").empty();
    }

    function clearTrackResults() {
        $("#most-popular-tracks").empty();
    }
});