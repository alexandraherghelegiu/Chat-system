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

self.addEventListener('fetch', function(event) {

    //event raised
    event.respondWith(
        (async () => {
            const cachedResp = await caches.match(event.request);
            console.log(event.request)
            //If cached record exists
            if (cachedResp) {
                //Try connecting
                try {
                    const fetchResp = await fetch(event.request);

                    if (!fetchResp || fetchResp.status !== 200) {
                        return cachedResponse;
                    }
                    if (fetchResp) {
                        let responseToCache = fetchResp.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            return cache.put(event.request, responseToCache);
                        }).catch(function (err) {
                            console.log('error opening cache ' + err);
                        });
                        return fetchResp;
                    }
                } catch (e) {
                    return cachedResp
                }
            }
            //If no records in cache
            else {
                //Try connecting
                try {
                    const fetchResp = await fetch(event.request);
                    if (fetchResp) {
                        let responseToCache = fetchResp.clone();
                        caches.open(CACHE_NAME).then(function (cache) {
                            return cache.put(event.request, responseToCache);
                        }).catch(function (err) {
                            console.log('error opening cache ' + err);
                        });
                        return fetchResp;
                    }
                } catch (e) {
                    console.log("No record found in cache and fetch failed: " + e);
                }

            }
        })());

});
