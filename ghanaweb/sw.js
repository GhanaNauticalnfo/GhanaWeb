importScripts('/libs/workbox-sw/2.1.2/workbox-sw.prod.v2.1.2.js');

const workboxSW = new self.WorkboxSW({
  "skipWaiting": true,
  "clientsClaim": true
});
workboxSW.precache([]);

workboxSW.router.registerRoute(/.*80x15.png/, workboxSW.strategies.staleWhileRevalidate({}), 'GET');
workboxSW.router.registerRoute(/keycloak.json/, workboxSW.strategies.staleWhileRevalidate({}), 'GET');
