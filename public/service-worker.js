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

const fonts = [
    '/fonts/Montserrat-Thin.ttf',
    '/fonts/Montserrat-ExtraLight.ttf',
    '/fonts/Montserrat-Light.ttf',
    '/fonts/Montserrat-Regular.ttf',
    '/fonts/Montserrat-Medium.ttf',
    '/fonts/Montserrat-SemiBold.ttf',
    '/fonts/Montserrat-Bold.ttf',
    '/fonts/Montserrat-ExtraBold.ttf',
    '/fonts/Montserrat-Black.ttf'
];

const urlsToCache = [
    '/',
    '/manifest.webmanifest',
    '/css/styles.css',
    '/css/font.css',
    '/js/script.js',
    '/js/user_feedback.js'
].concat(icons).concat(fonts);

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
    console.log('Fetch event: ', event.request)

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return and not fetch when it is cached
            if (cachedResponse) {
                console.log("Found in cache!", cachedResponse)
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
