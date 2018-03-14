/**
 * Calculates OSM tile url's for a given extent (in this case Ghana) and transform them to a Workbox route expression.
 */
global.window = {};
global.navigator = {
    userAgent: ''
};
require('ol');
var extent = require('ol/extent');
var tilegrid = require('ol/tilegrid');
var proj = require('ol/proj');
var tileurlfunction = require('ol/tileurlfunction');

var anExtent = extent.boundingExtent(
    [
        proj.fromLonLat([-4.0, 11.0]),
        proj.fromLonLat([2.2, 11.0]),
        proj.fromLonLat([2.2, 1.5]),
        proj.fromLonLat([-4.0, 1.5])
    ]);

var url = 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var urls = tileurlfunction.expandUrl(url);
var maxZoom = 17;
var grid = tilegrid.createXYZ({
    extent: tilegrid.extentFromProjection('EPSG:3857'),
    maxZoom: maxZoom,
    minZoom: undefined,
    tileSize: undefined
});
const tileUrlFunc = tileurlfunction.createFromTemplates(urls, grid);


for (let i = 0; i <= maxZoom; i++) {
// for (let i = 0; i <= 2; i++) {
    let minX = 99999999;
    let maxX = 0;
    let minY = 99999999;
    let maxY = 0;
    grid.forEachTileCoord(anExtent, i, function (tileCoord) {
        // console.log(tileCoord);
        // console.log(tileUrlFunc(tileCoord));
        minX = Math.min(tileCoord[1], minX);
        minY = Math.min(-tileCoord[2] - 1, minY);
        maxX = Math.max(tileCoord[1], maxX);
        maxY = Math.max(-tileCoord[2] - 1, maxY);
    });
      // console.log([i, minX, maxX, minY, maxY]);
      console.log('workboxSW.router.registerRoute(/.*[a-c].tile.openstreetmap.org.*\\/'+i+'\\/('+toRegExp(minX, maxX)+')\\/('+toRegExp(minY, maxY)+')\\.png/, osmCacheFirst, \'GET\');');

}

/*
const reg = /.*[a-c].tile.openstreetmap.org.*\/17\/(64[1-9][0-9][0-9]|640[8-9][0-9]|640[7-9]9|66[0-2][0-9][0-9]|663[0-2][0-9]|6633[0-6])\/(61[6-9][0-9][0-9]|615[1-9][0-9]|615[0-7][6-9]|64[0-8][0-9][0-9]|649[0-7][0-9]|6498[0-9])\.png/;
const res = reg.test("http://localhost:8080/rest/nw-nm/messages?lang=en&instanceId=urn%3Amrn%3Amcl%3Aservice%3Ainstance%3Adma%3Anw-nm-ghana&mainType=NW&wkt=POLYGON((-0.5889955173492432%206.754420322537541%2C-0.5889955173492432%206.764179628206861%2C-0.5482044826507568%206.764179628206861%2C-0.5482044826507568%206.754420322537541%2C-0.5889955173492432%206.754420322537541))");
console.log(res);
*/
/*
console.log("input 0-0:       "+ toRegExp(0, 0));
console.log("input 1-1:       "+ toRegExp(1, 1));
console.log("input 11-25:     "+ toRegExp(11, 25));
console.log("input 111-255:   "+ toRegExp(111, 255));
console.log("input 111-355:   "+ toRegExp(111, 355));
console.log("input 11-15:     "+ toRegExp(11, 15));
console.log("input 111-115:   "+ toRegExp(111, 115));
console.log("input 1110-1150: "+ toRegExp(1110, 1150));
console.log("input 110-150:   "+ toRegExp(110, 150));
console.log("input 1101-1501: "+ toRegExp(1101, 1501));
*/
/*
console.log("input 801-1501: "+ toRegExp(801, 1501));
console.log("input 888-1511: "+ toRegExp(888, 1511));
console.log("input 1000-2000: "+ toRegExp(1000, 2000));
*/

/**
 * Converts an interval to a regular expression
 * @param min the lower end of the interval
 * @param max the upper end of the interval
 * @returns {string} part of a regular expresion capturing all numbers in the given interval e.g. min=250;max=259 => 25[0-9]
 */
function toRegExp(min, max) {
    const result = [];
    const minString = min.toString();
    const maxString = max.toString();

    const digitCountMin = minString.length;
    const digitCountMax = maxString.length;

    if (digitCountMin === digitCountMax) {
        handlePosition(0);
    } else {
        minToMaxExclusive(minString, []);
        result.push("|");
        handleMax(maxString, []);
    }

    return result.join('');

    function handlePosition(i, digitsHandled, maxDigitsHandled) {
        digitsHandled = digitsHandled || [];
        maxDigitsHandled = maxDigitsHandled || [];
        const digitMin = minString.charAt(i);
        const digitMax = maxString.charAt(i);

        if (i === digitCountMin) {
            result.push(digitsHandled);
        } else if (digitMin === digitMax) {
            digitsHandled.push(digitMin);
            maxDigitsHandled.push(digitMax);
            handlePosition(i+1, digitsHandled, maxDigitsHandled);
        } else {
            if (i === digitCountMin - 1) {
                result.push(digitsHandled.join(""));
                result.push(getRangeExpression(digitMin, digitMax));
            } else {
                minToMaxExclusive(minString.substring(i), digitsHandled);
                result.push("|");
                handleMax(maxString.substring(i), maxDigitsHandled);
            }
        }

    }
    function minToMaxExclusive(minNumberString, digitsHandled) {
        result.push(digitsHandled.join(""));
        const length = minNumberString.length;
        const firstDigit = minNumberString.charAt(0);
        const correspondingMaxDigit = maxString.charAt(digitsHandled.length);
        const correspondingMaxDigitNumber = Number(correspondingMaxDigit);
        const firstDigitNumber = Number(firstDigit);

        if (length > 2) {
            result.push(firstDigit);
            result.push(getRangeExpression((Number(minNumberString.charAt(1)) + 1), "9"));
            for (let i = 2; i < length; i++) {
                result.push("[0-9]");
            }
            result.push("|");
            digitsHandled.push(firstDigit);
            minToMaxExclusive(minNumberString.substring(1), digitsHandled);
        } else {
            const nextDigit = minNumberString.charAt(1);
            if (correspondingMaxDigitNumber - firstDigitNumber === 1) {
                result.push(firstDigit);
            } else if (correspondingMaxDigitNumber > firstDigitNumber) {
                result.push(getRangeExpression(firstDigit, (correspondingMaxDigitNumber - 1)));
            } else {
                result.push(getRangeExpression(firstDigit, "9"));
            }
            result.push(getRangeExpression(nextDigit, "9"));
        }
    }

    function handleMax(maxNumberString, digitsHandled) {
        let firstDigit = maxNumberString.charAt(0);
        digitsHandled = digitsHandled || [];
        digitsHandled.push(firstDigit);
        let length = maxNumberString.length;

        if (length > 2) {
            let number = (Number(maxNumberString.charAt(1)) - 1);
            if (number >= 0) {
                result.push(digitsHandled.join(""));
                result.push(getRangeExpression("0", number));
                for (let i = 2; i < length; i++) {
                    result.push("[0-9]");
                }
                result.push("|");
            }
            handleMax(maxNumberString.substring(1), digitsHandled);

        } else {
            result.push(digitsHandled.join(""));
            result.push(getRangeExpression("0", maxNumberString.charAt(1)));
        }

    }

    function getRangeExpression(from, to) {
        return Number(from) === Number(to) ? from : "[" + from + "-" + to +"]";
    }
}