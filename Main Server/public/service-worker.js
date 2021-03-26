const CACHE_NAME = 'spy-system-cache-sw';
let urlsToCache = [
    '/',
    '/stylesheets/bootstrap.css',
    '/stylesheets/style.css',
    '/javascripts/room.js',
    '/javascripts/dashboard.js',
    '/javascripts/camera.js',
    '/javascripts/canvas.js',
    '/javascripts/index.js',
    '/javascripts/indexed_database.js',
    '/javascripts/ajax.js',
    '/javascripts/utils.js',
    '/javascripts/jquery.min.js'
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
    //event raised
    event.respondWith(
        caches.match(event.request)
            .then(function(cachedResponse){
                //if there's something in the cache
                return fetch(event.request).then(
                    function(response){
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return cachedResponse;
                        }
                        let responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(function(cache){
                            return cache.put(event.request, responseToCache);
                        }).catch(function(err){
                            console.log('error opening cache ' + err);
                        });
                        return response;
                    }
                ).catch(function(err){
                    //Returning result from cache
                    return cachedResponse;
                });

            })
    )
});

