const CACHE_NAME = 'spy-system-cache-sw';
let urlsToCache = [
    '/',
    '/styles/style.css',
    '/styles/boostrap.css',
    '/javascripts/canvas.js',
    '/javascripts/camera.js',
    '/javascripts/dashboard.js',
];


self.addEventListener('install', function(event){
    //Installing SW
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache){
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    )
});

self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request)
            .then(function(response){
                if (response) {
                    return response;
                }

            return fetch(event.request);})
    )
});

