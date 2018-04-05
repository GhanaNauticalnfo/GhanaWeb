module.exports = {
    "globDirectory": "target\\sw-prepare\\",
    "globPatterns": [
        "**/*.{png,svg,html,js,kml,map,json,css,xml,woff2}"
    ],
    "swSrc": "sw.js",
    "swDest": "src\\main\\webapp\\sw.js",
    "clientsClaim": true,
    "skipWaiting": true,
    "globIgnores": [
        "img/!(bgr_refuse*|vessel*).png",
        "libs/sw-toolbox/**",
        "libs/workbox-sw/**",
        "libs/xmllint/**",
        "libs/**/*debug*.js",
        "libs/**/package.json",
        "**/barrenswatch_no_salstraumen.json",
        // "libs/angular-timeago/*",
        "META-INF/**",
        "WEB-INF/**",
        "sw.js",
    ],
/*
    "runtimeCaching":  [
        {
            "urlPattern": new RegExp('.*80X15.png'),
            "handler": "staleWhileRevalidate"
        }
    ]
*/
};
