const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const fetch = require("node-fetch");

module.exports = {
    fetchToken: async function () {
        const id = process.env.CLIENT_ID;
        const secret = process.env.CLIENT_SECRET;

        const token = Buffer.from(`${id}:${secret}`).toString('base64');

        const url = "https://accounts.spotify.com/api/token";
        const requestType = "POST";
        return new Promise(function (resolve, reject) {

            var xhr = new XMLHttpRequest();
            xhr.open(requestType, url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Authorization", "Basic " + token);
            xhr.onload = function (e) {
                // Ready state 4 = DONE, the operation is complete
                if (xhr.readyState === 4) {
                    // On success
                    if (xhr.status === 200) {
                        // Check if the response object is not undefined
                        if (!(xhr && xhr.responseText)) {
                            reject("Response is undefined");
                        }

                        // Parse the response from a string to JSON object
                        const responseText = JSON.parse(xhr.responseText);

                        if (responseText) {
                            resolve(responseText);
                        }
                    } else {
                        reject("Fetching token was not successful, return status: " + xhr.status);
                    }
                }
            };
            xhr.onerror = function (e) {
                reject("Fetching token was not successful, error: " + xhr.statusText);
            };
            xhr.send("grant_type=client_credentials");
        });

    },

    fetchLoginOAuth: async function() {
        const id = process.env.CLIENT_ID;
        const secret = process.env.CLIENT_SECRET;

        const url = 'https://accounts.spotify.com/api/token';

        try {
            const encryptedToken = Buffer.from(`${id}:${secret}`).toString('base64');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${encryptedToken}`
                },
                body: 'grant_type=client_credentials'
            });

            console.log("New token fetched");

            return response.json();
        } catch (error) {
            console.log("Something went wrong", error);
        }
    },

    fetchArtists: async function (input, token) {
        const baseUrl = "https://api.spotify.com/v1/";
        const requestType = "GET";

        // Search for artists
        const searchType = "artist";

        // Only load the 5 most popular artists
        const itemsToLoad = 5;

        const finalUrl = `${baseUrl}search?q=${input}&type=${searchType}&limit=${itemsToLoad}`;
        const encodedFinalUrl = encodeURI(finalUrl);

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(requestType, encodedFinalUrl, true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.onload = function (e) {
                // Ready state 4 = DONE, the operation is complete
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // Check if response is not undefined
                        if (xhr && xhr.responseText) {
                            // Parse the data to a JSON object
                            const parsedData = JSON.parse(xhr.responseText);

                            // Check if the items of artists is an Array
                            if (parsedData && parsedData.artists && Array.isArray(parsedData.artists.items)) {
                                resolve(parsedData.artists.items);
                            }
                        } else {
                            reject(this.statusText);
                        }

                    } else {
                        // console.log("xhr.status:", xhr)

                        reject(xhr.responseText);
                    }
                }
            };
            xhr.onerror = function (e) {

                reject(this.statusText);
            };
            xhr.send();
        });
    },

    fetchArtistNameById: async function (artistId, token) {

        const requestType = "GET";
        const finalUrl = `https://api.spotify.com/v1/artists/${artistId}`;

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(requestType, finalUrl, true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.onload = function (e) {
                // Ready state 4 = DONE, the operation is complete
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // Check if response is not undefined
                        if (xhr && xhr.responseText) {
                            // Parse the data to a JSON object
                            const parsedData = JSON.parse(xhr.responseText);

                            // Check if the items of artists is an Array
                            if (parsedData && parsedData.name) {

                                resolve(parsedData.name);
                            } else {
                                reject(this.statusText);
                            }
                        } else {
                            reject(this.statusText);
                        }

                    } else {
                        reject(this.statusText);
                    }
                }
            };
            xhr.onerror = function (e) {
                reject(this.statusText);
            };
            xhr.send();
        });
    },

    fetchAlbumsByArtistId: async function (token, artistId) {
        const baseUrl = "https://api.spotify.com/v1/";
        const requestType = "GET";
        const itemsToLoad = 50;

        const finalUrl = `${baseUrl}artists/${artistId}/albums?limit=${itemsToLoad}`;

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(requestType, finalUrl, true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.onload = function (e) {
                // Ready state 4 = DONE, the operation is complete
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // Check if response is not undefined
                        if (xhr && xhr.responseText) {
                            // Parse the data to a JSON object
                            const parsedData = JSON.parse(xhr.responseText);

                            // Check if the items of artists is an Array
                            if (parsedData) {
                                resolve(parsedData);
                            } else {
                                reject(this.statusText);
                            }
                        } else {
                            reject(this.statusText);
                        }

                    } else {
                        reject(this.statusText);
                    }
                }
            };
            xhr.onerror = function (e) {
                reject(this.statusText);
            };
            xhr.send();
        });
    },

    fetchByUrl: async function (token, url) {
        const requestType = "GET";

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(requestType, url, true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.onload = function (e) {
                // Ready state 4 = DONE, the operation is complete
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // Check if response is not undefined
                        if (xhr && xhr.responseText) {
                            // Parse the data to a JSON object
                            const parsedData = JSON.parse(xhr.responseText);

                            // Check if the items of artists is an Array
                            if (parsedData) {
                                resolve(parsedData);
                            } else {
                                reject(this.statusText);
                            }
                        } else {
                            reject(this.statusText);
                        }

                    } else {
                        reject(this.statusText);
                    }
                }
            };
            xhr.onerror = function (e) {
                reject(this.statusText);
            };
            xhr.send();
        });
    },

    fetchAlbumsByAlbumIds: async function (token, albumsIds) {
        const baseUrl = "https://api.spotify.com/v1";
        const itemType = "albums";
        const requestType = "GET";

        const finalUrl = `${baseUrl}/${itemType}?ids=${albumsIds}`;

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(requestType, finalUrl, true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.onload = function (e) {
                // Ready state 4 = DONE, the operation is complete
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // Check if response is not undefined
                        if (xhr && xhr.responseText) {
                            // Parse the data to a JSON object
                            const parsedData = JSON.parse(xhr.responseText);

                            // Check if the items of artists is an Array
                            if (parsedData) {
                                resolve(parsedData);
                            } else {
                                reject(this.statusText);
                            }
                        } else {
                            reject(this.statusText);
                        }

                    } else {
                        reject(this.statusText);
                    }
                }
            };
            xhr.onerror = function (e) {
                reject(this.statusText);
            };
            xhr.send();
        });
    },

    fetchItemsByItemIds: async function (token, itemType, ids) {
        const baseUrl = "https://api.spotify.com/v1";
        const requestType = "GET";

        const finalUrl = `${baseUrl}/${itemType}?ids=${ids}`;

        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(requestType, finalUrl, true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.onload = function (e) {
                // Ready state 4 = DONE, the operation is complete
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // Check if response is not undefined
                        if (xhr && xhr.responseText) {
                            // Parse the data to a JSON object
                            const parsedData = JSON.parse(xhr.responseText);

                            // Check if the items of artists is an Array
                            if (parsedData) {
                                resolve(parsedData);
                            } else {
                                reject(this.statusText);
                            }
                        } else {
                            reject(this.statusText);
                        }

                    } else {
                        reject(this.statusText);
                    }
                }
            };
            xhr.onerror = function (e) {
                reject(this.statusText);
            };
            xhr.send();
        });
    }
};