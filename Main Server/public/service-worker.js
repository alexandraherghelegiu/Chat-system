const CACHE_NAME = 'spy-system-cache-sw';
let urlsToCache = [
    '/',
    '/stylesheets/bootstrap.css',
    '/stylesheets/style.css',
    '/javascripts/dashboard.js',
    '/javascripts/camera.js',
    '/javascripts/canvas.js',
    '/javascripts/index.js',
    '/javascripts/indexed_database.js',
    '/javascripts/ajax.js'
];


self.addEventListener('install', function(event){
    //Installing SW
    console.log('installing service worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache){
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
                return fetch(event.request).then(
                    function(response){
                        if(!response || response.status !== 200 || response.type !== 'basic'){
                            console.log('response not good ' + response.status);
                            return response
                        }

                        let responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(function(cache){
                            cache.put(event.request, responseToCache);
                        });
                        return response;
                    }
                );
            })
    )
});

