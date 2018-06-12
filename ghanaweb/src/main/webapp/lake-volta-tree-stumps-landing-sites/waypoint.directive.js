(function () {
    'use strict';

    angular
        .module('maritimeweb.volta')
        .directive('waypointLayer', waypointLayer);

    waypointLayer.$inject = ['MapService'];

    function waypointLayer(MapService) {
        var directive = {
            restrict: 'E',
            template: '<div id="popup" class="ol-popup">' +
            '<a href="#" id="popup-closer" class="ol-popup-closer"></a>' +
            '<div id="popup-content">' +
            '<p><img ng-src="{{popupImgSrc}}" alt="{{popupImgAlt}}"/> {{name}}</p>' +
            '<code>{{(hazardPos | lonlat:{ decimals : 2, pp: true })}}</code></div>' +
            '</div>',
            require: '^olMap',
            scope: {},
            link: link
        };
        return directive;

        function link(scope, element, attrs, ctrl) {
            var waypointLayer = createWaypointLayer();
            var geoJson = {
                'type': 'FeatureCollection',
                'features': [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                1.0,
                                0.0
                            ]
                        },
                        "properties": {
                            "name": "WPx1"
                        }
                    }, {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                0.05888888888888889,
                                6.325277777777777
                            ]
                        },
                        "properties": {
                            "name": "WPx1"
                        }
                    }, {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                6.325277777777777,
                                0.05888888888888889
                            ]
                        },
                        "properties": {
                            "name": "WP01"
                        }
                    }, {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [904934.6939069864, -38405.45640271782]
                        }
                    }, {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [0, 0]
                        }
                    }, {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [3, 0]
                        }
                    }
                ]
            };

            var selectedFeature;

            waypointLayer.getSource().on("addfeature", function (evt) {
                console.log(evt);
            });

            function createWaypointLayer() {
                var layer = new ol.layer.Vector(/** @type {olx.layer.VectorOptions}*/{
                    // declutter: true,
                    maxResolution: 620,
                    source: new ol.source.Vector(/** @type {olx.source.VectorOptions}*/{
                        url: 'lake-volta-tree-stumps-landing-sites/waypoint-north-south-route.json',
                        format: new ol.format.GeoJSON(),
                    })
                });

                return layer;
            }

            var styleFunction = function (feature, resolution) {
                var styles = [];
                styles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                    image: new ol.style.Circle({
                        radius: 3,
                        stroke: new ol.style.Stroke({
                            width: 1,
                            color: 'yellow'
                        }),
                    })
                }));
                return styles;
            };

            waypointLayer.setStyle(styleFunction);

            //popup inspired by  https://openlayers.org/en/latest/examples/popup.html
            var container = document.getElementById('popup');
            var closer = document.getElementById('popup-closer');


            /**
             * Create an overlay to anchor the popup to the map.
             */
            var overlay = new ol.Overlay(/** @type {olx.OverlayOptions}*/{
                element: container,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            });

            closer.onclick = function () {
                overlay.setPosition(undefined);
                closer.blur();
                return false;
            };


            var olScope = ctrl.getOpenlayersScope();
            olScope.getMap().then(function (map) {
                map.addLayer(waypointLayer);
                map.addLayer(testLayer);
                map.addOverlay(overlay);

                var listenerKeys = map.on(['click', 'pointermove'], function (e) {
                    var selected = false;
                    var pixel = map.getEventPixel(e.originalEvent);
                    var hitThis = map.hasFeatureAtPixel(pixel, {
                        layerFilter: function (layerCandidate) {
                            return layerCandidate === waypointLayer;
                        }
                    });

                    map.getTarget().style.cursor = hitThis ? 'pointer' : '';
                    if (e.type === "pointermove") return;

                    if (hitThis) {
                        map.forEachFeatureAtPixel(pixel, function (feature) {
                            selectedFeature = feature;
                            selected = true;
                            overlay.setPosition(e.coordinate);
                            var lonlat = MapService.toLonLat(selectedFeature.getGeometry().getFirstCoordinate());
                            scope.hazardPos = {lon: lonlat[0], lat: lonlat[1]};
                            scope.name = selectedFeature.get("description");
                            scope.popupImgSrc = selectedFeature.get("popupImgSrc");
                            scope.popupImgAlt = selectedFeature.get("popupImgAlt");

                        }, /** @type olx.AtPixelOptions */{
                            layerFilter: function (layerCandidate) {
                                return layerCandidate === waypointLayer;
                            }
                        });
                    }
                    if (!selected) {
                        selectedFeature = undefined;
                    }

                    waypointLayer.getSource().changed();
                });

                // Clean up when the scope is destroyed
                scope.$on('$destroy', function () {
                    if (angular.isDefined(waypointLayer)) {
                        map.removeLayer(waypointLayer);
                    }
                    if (angular.isDefined(overlay)) {
                        map.removeOverlay(overlay);
                    }
                    if (listenerKeys) {
                        ol.Observable.unByKey(listenerKeys);
                    }
                });
            })
        }
    }
})();