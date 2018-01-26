var CACHE_VERSION = 1;
var CURRENT_CACHES = {
    prefetch: 'prefetch-cache-v' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
    var now = Date.now();

    var urlsToPrefetch = [
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-animate.min.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-sanitize.min.js',
        'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-route.min.js',
        'https://angular-ui.github.io/bootstrap/ui-bootstrap-tpls-1.3.3.min.js',
        'https://use.fontawesome.com/40f01fd2ee.js',
        'https://use.fontawesome.com/webfontloader/1.6.24/webfontloader.js',
        'https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js',
        'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
        'https://cdn.rawgit.com/abdmob/x2js/master/xml2json.js',
        'https://openlayers.org/en/v4.3.4/build/ol.js',
        'https://cdn.rawgit.com/kripken/xml.js/master/xmllint.js',
        'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment-with-locales.js',
        'https://cdn.rawgit.com/indrimuska/angular-moment-picker/master/dist/angular-moment-picker.min.js',
        'https://cdn.rawgit.com/indrimuska/angular-moment-picker/master/dist/angular-moment-picker.min.css',
        'https://openlayers.org/en/v4.3.2/css/ol.css',
        'https://netdna.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
        'https://use.fontawesome.com/releases/v4.6.3/fonts/fontawesome-webfont.woff2',

        'libs/json-formatter/dist/json-formatter.min.js',
        'libs/world-flags/flags16.css',
        'libs/world-flags/flags32.css',
        'libs/angular-datetime-inputs/datetime-inputs.min.css',
        'style/ghanaweb.css',
        'libs/growl2-lib/angular-growl.min.css',
        'libs/json-formatter/dist/json-formatter.min.css',
        'libs/angular-timeago/dist/angular-timeago.js',
        'libs/turfjs/turfjs.min.js',
        'libs/growl2-lib/angular-growl.min.js',
        'libs/keycloak/keycloak.js',
        'main-app/keycloak-angular-initializer.js',
        'main-app/app.js',
        'main-app/app-ctrl.js',
        'main-app/app-route-config.js',
        'main-app/growl-config.js',
        'map/position.js',
        'map/map-service.js',
        'map/map-directives.js',
        'service-registry/service-registry-service.js',
        'service-registry/mc-sr-ctrl.js',
        'nw-nm/nw-nm-layer.js',
        'lake-volta-tree-stumps-landing-sites/tree-stump-layer.directive.js',
    ];

    // All of these logging statements should be visible via the "Inspect" interface
    // for the relevant SW accessed via chrome://serviceworker-internals
    console.log('Handling install event. Resources to prefetch:', urlsToPrefetch);

    event.waitUntil(
        caches.open(CURRENT_CACHES.prefetch).then(function(cache) {
            var cachePromises = urlsToPrefetch.map(function(urlToPrefetch) {
                // This constructs a new URL object using the service worker's script location as the base
                // for relative URLs.
                var url = new URL(urlToPrefetch, location.href);
                // Append a cache-bust=TIMESTAMP URL parameter to each URL's query string.
                // This is particularly important when precaching resources that are later used in the
                // fetch handler as responses directly, without consulting the network (i.e. cache-first).
                // If we were to get back a response from the HTTP browser cache for this precaching request
                // then that stale response would be used indefinitely, or at least until the next time
                // the service worker script changes triggering the install flow.
                url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;

                // It's very important to use {mode: 'no-cors'} if there is any chance that
                // the resources being fetched are served off of a server that doesn't support
                // CORS (http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).
                // In this example, www.chromium.org doesn't support CORS, and the fetch()
                // would fail if the default mode of 'cors' was used for the fetch() request.
                // The drawback of hardcoding {mode: 'no-cors'} is that the response from all
                // cross-origin hosts will always be opaque
                // (https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#cross-origin-resources)
                // and it is not possible to determine whether an opaque response represents a success or failure
                // (https://github.com/whatwg/fetch/issues/14).
                var request = new Request(url, {mode: 'no-cors'});
                return fetch(request).then(function(response) {
                    if (response.status >= 400) {
                        throw new Error('request for ' + urlToPrefetch +
                            ' failed with status ' + response.statusText);
                    }

                    // Use the original URL without the cache-busting parameter as the key for cache.put().
                    return cache.put(urlToPrefetch, response);
                }).catch(function(error) {
                    console.error('Not caching ' + urlToPrefetch + ' due to ' + error);
                });
            });

            return Promise.all(cachePromises).then(function() {
                console.log('Pre-fetching complete.');
            });
        }).catch(function(error) {
            console.error('Pre-fetching failed:', error);
        })
    );
});

self.addEventListener('activate', function(event) {
    // Delete all caches that aren't named in CURRENT_CACHES.
    // While there is only one cache in this example, the same logic will handle the case where
    // there are multiple versioned caches.
    var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
        return CURRENT_CACHES[key];
    });

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (expectedCacheNames.indexOf(cacheName) === -1) {
                        // If this cache name isn't present in the array of "expected" cache names, then delete it.
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log('Handling fetch event for', event.request.url);

    event.respondWith(
        // caches.match() will look for a cache entry in all of the caches available to the service worker.
        // It's an alternative to first opening a specific named cache and then matching on that.
        caches.match(event.request).then(function(response) {
            if (response) {
                console.log('Found response in cache:', response);

                return response;
            }

            console.log('No response found in cache. About to fetch from network...');

            // event.request will always have the proper mode set ('cors, 'no-cors', etc.) so we don't
            // have to hardcode 'no-cors' like we do when fetch()ing in the install handler.
            return fetch(event.request).then(function(response) {
                console.log('Response from network is:', response);

                return response;
            }).catch(function(error) {
                // This catch() will handle exceptions thrown from the fetch() operation.
                // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
                // It will return a normal response object that has the appropriate error code set.
                console.error('Fetching failed:', error);

                throw error;
            });
        })
    );
});