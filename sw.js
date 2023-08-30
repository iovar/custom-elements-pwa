const cacheName = 'cache-v3';

const getPathname = () => {
    const { pathname } = self.location;
    return pathname.substring(0, pathname.lastIndexOf(FILENAME));
}

const getCachedFiles = async () => {
    const response = await fetch('./config.json');
    const config = await response.json();
    const BASE_PATH = config.prefixWithPathname
        ? `${getPathname()}${config.LIB_DIR}`
        : `${config.LIB_DIR}`;

    return [
        './',
        `${BASE_PATH}/base-component.js`,
        `${BASE_PATH}/dynamic-template.js`,
        `${BASE_PATH}/remote-template.js`,
        'js/register-components.js',
        'icon.png',
        'index.html',
        'sw.js',
        'manifest.json',
    ];
};

const addFilesToCache = async () => {
    const cache = await caches.open(cacheName);
    const cachedFiles = await getCachedFiles();
    return cache.addAll(cachedFiles);
};

const removeStaleCaches = async () => {
    const keys = await caches.keys();
    const staleKeys = keys.filter((key) => key !== cacheName);

    return Promise.all(staleKeys.map((key) => caches.delete(key)));
}

const fetchFromNetwork = async (cache, event) => {
    const networkResponse = await fetch(event.request);
    cache.put(event.request, networkResponse.clone());

    return networkResponse;
};

const fetchFromCacheFirst = async (event) => {
    const cache = await caches.open(cacheName);
    const response = await cache.match(event.request);

    if (response && !navigator.onLine) {
        return response;
    }

    return fetchFromNetwork(cache, event);
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => event.waitUntil(removeStaleCaches()));

self.addEventListener('fetch', (event) => event.respondWith(fetchFromCacheFirst(event)));
