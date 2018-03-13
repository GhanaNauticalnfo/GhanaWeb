importScripts('/libs/workbox-sw/2.1.2/workbox-sw.prod.v2.1.2.js');

const workboxSW = new self.WorkboxSW({
  "skipWaiting": true,
  "clientsClaim": true
});
workboxSW.precache([]);

workboxSW.router.registerRoute(/.*80x15.png/, workboxSW.strategies.staleWhileRevalidate({}), 'GET');
workboxSW.router.registerRoute(/keycloak.json/, workboxSW.strategies.staleWhileRevalidate({}), 'GET');

const osmCacheFirst = workboxSW.strategies.cacheFirst(
    {
        cacheName: 'osm',
        cacheExpiration: {
            maxEntries: 3000,
            maxAgeSeconds: 180 * 24 * 60 * 60
        }
});
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/0\/(0)\/(0)\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/1\/([0-1])\/(0)\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/2\/([1-2])\/(1)\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/3\/([3-4])\/(3)\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/4\/([7-8])\/(7)\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/5\/(1[5-6])\/(1,5)\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/6\/(3[1-2])\/(3[0-1])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/7\/(6[2-4])\/(6[0-3])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/8\/(12[5-9])\/(12[0-6])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/9\/(25[0-9])\/(24[0-9]|25[0-3])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/10\/(50[0-9]|51[0-8])\/(49[0-9]|4[8-9][0-9]|50[0-7])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/11\/(10[0-2][1-9]|103[0-6])\/(9[7-9][0-9]|9[6-9][1-9]|100[0-9]|101[0-5])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/12\/(20[0-6][2-9]|207[0-3])\/(1[10-9][0-9][0-9]|19[3-9][0-9]|192[2-9]|20[0-2][0-9]|2030)\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/13\/(40[1-9][0-9]|40[0-3][4-9]|41[0-3][0-9]|414[0-6])\/(39[0-9][0-9]|38[5-9][0-9]|38[4-5][4-9]|40[0-5][0-9]|406[0-1])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/14\/(80[1-9][0-9]|80[0-8]9|82[0-8][0-9]|829[0-2])\/(7[7-9][0-9][0-9]|769[0-9]|76[8-9][8-9]|80[0-9][0-9]|81[0-1][0-9]|812[0-3])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/15\/(160[2-9][0-9]|160[1-7]9|165[0-7][0-9]|1658[0-4])\/(15[4-9][0-9][0-9]|153[8-9][0-9]|153[7-9][6-9]|16[0-1][0-9][0-9]|162[0-3][0-9]|1624[0-7])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/16\/(32[1-9][0-9][0-9]|320[4-9][0-9]|320[3-5]9|330[0-9][0-9]|331[0-5][0-9]|3316[0-8])\/(30[8-9][0-9][0-9]|307[6-9][0-9]|307[5-8][3-9]|32[0-3][0-9][0-9]|324[0-8][0-9]|3249[0-4])\.png/, osmCacheFirst, 'GET');
workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\/17\/(64[1-9][0-9][0-9]|640[8-9][0-9]|640[7-9]9|66[0-2][0-9][0-9]|663[0-2][0-9]|6633[0-6])\/(61[6-9][0-9][0-9]|615[1-9][0-9]|615[0-7][6-9]|64[0-8][0-9][0-9]|649[0-7][0-9]|6498[0-9])\.png/, osmCacheFirst, 'GET');
