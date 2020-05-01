const CORE_CACHE = 1;
const CACHE_NAME = `core-cache-v${CORE_CACHE}`;

const icons = [
    '/icons/microphone-icon.svg',
    '/icons/microphone-icon-192.png',
    '/icons/account_box-24px.svg',
    '/icons/add_circle_outline-24px.svg',
    '/icons/check_circle_outline-24px.svg',
    '/icons/error_outline-24px.svg',
    '/icons/group-24px.svg',
    '/icons/launch-24px.svg',
    '/css/loading-animation.svg'
];

const urlsToCache = [
    '/',
    '/manifest.webmanifest',
    '/css/styles.css',
    '/js/script.js',
    '/js/jquery-3.4.1.min.js',
    '/js/user_feedback.js'
].concat(icons);

self.addEventListener('install', (event) => {
    console.log('Service worker install event!');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache).then(() => self.skipWaiting);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Servive worker activated!');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return and not fetch when it is cached
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).catch(e => {
                return caches.open(CACHE_NAME)
                    .then(cache => {
                        console.log("Offline!");
                    });
            });
        })
    );

});
