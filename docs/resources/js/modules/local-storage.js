async function getTokenFromLocalStorage() {
    // Check if localstorage is supported by browser/client. If not, fetch token and don't check localstorage
    if (!typeof (Storage)) return;

    const localAccessToken = localStorage.getItem("token");
    const localTokenExpirationTime = localStorage.getItem("tokenExpirationTime");

    // Taken from https://www.w3schools.com/jsref/jsref_obj_date.asp
    const currentTime = new Date().getTime() / 1000;

    // If the token stored locally is still valid, return it
    if (localAccessToken &&
        localTokenExpirationTime &&
        localTokenExpirationTime >= currentTime) return localAccessToken;

    return;
}

function setTokenInLocalStorage(accessToken, expiresIn) {
    // Check if values are not undefined. Check if localstorage is supported by browser/client
    if (accessToken && expiresIn) {
        if (typeof (Storage)) {
            // Get the time and convert it to seconds. 
            // Source: https://www.w3schools.com/jsref/jsref_obj_date.asp
            const currenTime = new Date().getTime() / 1000;

            // Time in seconds when 
            const tokenExpirationTime = currenTime + expiresIn;

            // Put the the token and expiration time in the localstorage .
            localStorage.setItem("token", accessToken);
            localStorage.setItem("tokenExpirationTime", tokenExpirationTime);
        }
    }
}

export { getTokenFromLocalStorage, setTokenInLocalStorage };