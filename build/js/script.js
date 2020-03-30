import*as userFeedback from"/js/user_feedback.js";let deferredPrompt,isOffline=!1;function lookupArtist(e){e&&e.length&&(navigator.onLine?(userFeedback.startLoadingFeedback(),clearEverything(),$.get(window.location.origin+"/artistId",{artistId:e},e=>{$("#most-popular-tracks").html(e),userFeedback.stopLoadingFeedback("Showing most popular tracks for artist","",!1)}).fail((function(e){userFeedback.stopLoadingFeedback("error on looking up artist",e,!0)})).catch((function(e){userFeedback.stopLoadingFeedback("error on looking up artist",e,!0)}))):showOfflineMessage())}function isString(e){return e&&""!==e&&e.length>0&&e.trim().length>0}function showOfflineMessage(){userFeedback.setUserFeedback("Offline","You are not connected to the internet!",!0)}function showOnlineMessage(){userFeedback.setUserFeedback("Online","Welcome back!",!1)}function showInstallPromotion(){$("#install-app").removeClass("hidden")}function hideInstallPromotion(){$("#install-app").addClass("hidden")}function clearEverything(){clearSearchBar(),clearTrackResults(),clearSearchResults()}function clearSearchBar(){$("#artist-name-input").val("")}function clearSearchResults(){$("#search-result").addClass("hidden"),$("#search-result").empty()}function clearTrackResults(){$("#most-popular-tracks").empty()}"serviceWorker"in navigator&&window.addEventListener("load",(function(){navigator.serviceWorker.register("/service-worker.js").then((function(e){return console.log("ServiceWorker registration successful with scope: ",e.scope),e.update()}))})),window.addEventListener("beforeinstallprompt",(function(e){e.preventDefault(),deferredPrompt=e,showInstallPromotion()})),window.addEventListener("appinstalled",e=>{hideInstallPromotion()}),window.addEventListener("offline",e=>{isOffline=!0,showOfflineMessage()}),window.addEventListener("online",e=>{isOffline&&(showOnlineMessage(),isOffline=!1)}),$(()=>{const e=window.location.hash.substring(1);e&&lookupArtist(e),$(window).on("hashchange",(function(e){lookupArtist(window.location.hash.substring(1))})),$("#install-app").on("click",(function(){deferredPrompt&&(showInstallPromotion(),deferredPrompt.prompt(),deferredPrompt.userChoice.then(e=>{"accepted"===e.outcome?(console.log("User accepted the install prompt"),hideInstallPromotion()):(console.log("User dismissed the install prompt"),showInstallPromotion())}))})),$("#artist-name-input").on("input",(function(){if(navigator.onLine){const e=$("#artist-name-input"),n=e?e.val():void 0;isString(n)?$.get(window.location.origin,{inputText:n},e=>{$("#search-result").removeClass("hidden"),$("#search-result").html(e)}).fail((function(e){console.log("Error fail",e)})).catch((function(e){console.log("Error",e)})):clearEverything()}else showOfflineMessage()}))});