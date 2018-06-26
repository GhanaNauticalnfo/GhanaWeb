(function () {
    'use strict';

    angular
        .module('maritimeweb.volta')
        .directive('lakeVoltaLayer', lakeVoltaLayer);

    lakeVoltaLayer.$inject = ['MapService', '$interval', 'LakeVoltaService'];

    function lakeVoltaLayer(MapService, $interval, LakeVoltaService) {
        var directive = {
            restrict: 'E',
            require: '^olMap',
            scope: {
                features:   '=?',
                fitExtent:      '@',
                maxZoom:        '@'

            },
            link: link
        };
        return directive;

        function link(scope, element, attrs, ctrl) {
            var lakeVoltaLayer = createLakeVoltaLayer();
            var maxZoom = scope.maxZoom ? parseInt(scope.maxZoom) : 11;
            var selectedFeature;


            function loadFeatures() {
                if (scope.features) {
                    $interval.cancel(stop);
                    scope.features.forEach(function (feature) {
                        var mainHeading = feature.heading;
                        feature.features.forEach(function (typeFeature) {
                            var typeHeading = typeFeature.heading;
                            typeFeature.featureCollectionVo.features.forEach(function (f) {
                                var olFeature = MapService.gjToOlFeature(f);
                                olFeature.set("mainHeading", mainHeading, true);
                                olFeature.set("typeHeading", typeHeading, true);
                                olFeature.set("type", typeFeature.type, true);
                                olFeature.set("mainFeature", feature, true);
                                olFeature.set("typeFeature", typeFeature, true);

                                if (typeFeature.type === "Tree") {
                                    olFeature.set("description", olFeature.get("characteristics") + ": " + typeHeading, true);
                                    olFeature.set("details", "Size of area to be cleared is " + olFeature.get("area-size") + " and the estimated number of trees to be cut is  " + olFeature.get("est-number-of-trees"), true);
                                }

                                if (typeFeature.type === "Waypoint") {
                                    olFeature.set("description", "Waypoint/Buoy (" + olFeature.get("name") + ") on the " + olFeature.get("mainHeading"), true);
                                    if (olFeature.get("waypointType") === "waypointConnector") {
                                        olFeature.set("description", olFeature.get("mainHeading"), true);
                                    }
                                }

                                if (typeFeature.type === "Characteristics") {
                                    olFeature.set("description", typeHeading, true);
                                }

                                if (typeFeature.type === "Fairway Characteristics") {
                                    olFeature.set("description", typeHeading + " (" + olFeature.get("LocationIdentifier") + ")" , true);
                                }

                                    lakeVoltaLayer.getSource().addFeature(olFeature);
                            });
                        });
                    });

                    if (fitExtentFn ) {
                        fitExtentFn();
                    }
                }
            }

            var stop = $interval(loadFeatures, 300);


            function createLakeVoltaLayer() {
                var layer = new ol.layer.Vector(/** @type {olx.layer.VectorOptions}*/{
                    // declutter: true,
                    maxResolution: 620,
                    source: new ol.source.Vector()
                });

                return layer;
            }

            var colorMap = {};
            var colors = [
                "#008000",
                "#FF0000",
                "#FFA500",
                "#FFFF00",
                "#000000",
                "#C0C0C0",
                "#808080",
            ];
            var colorIndex = 0;
            function getColor(feature) {
                var id = feature.get("mainHeading");
                if (!colorMap[id]) {
                    colorMap[id] = colors[colorIndex++];
                }
                return colorMap[id];
            }

            var styleFunction = function (feature, resolution) {
                var type = feature.get("type");
                var geometryType = feature.getGeometry().getType();

                var styles = [];
                if (type === "Fairway Characteristics") {
                    styles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                        image: new ol.style.Circle({
                            radius: 6,
                            stroke: new ol.style.Stroke({
                                width: 2,
                                color: 'red'
                            }),
                        })
                    }));
                } else if (type === "Characteristics") {
                    styles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                        image: new ol.style.RegularShape({
                            points: 4,
                            radius: 3,
                            stroke: new ol.style.Stroke({
                                width: 1,
                                color: 'black'
                            }),
                            fill: new ol.style.Fill({
                                color: 'black'
                            }),
                        })
                    }));
                } else if (type === "Waypoint") {
                    if (geometryType === "LineString") {
                        styles.push(new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: getColor(feature),
                                width: 2,
                                lineDash: [5, 5, 0, 5]
                            })
                        }));
                    } else {
                        var text = "";
                        if (resolution < 150) {
                            text = feature.get('name');
                        }
                        styles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            image: new ol.style.Icon(({
                                anchor: [0.5, 0.5],
                                opacity: 1.0,
                                src: 'img/lake-volta/safe_water.svg'
                            })),
                            text: new ol.style.Text({
                                text: text,
                                offsetY: 27,
                                fill: new ol.style.Fill({
                                    color: '#fff'
                                })
                            })
                        }));
                    }
                } else if (type === "Tree") {
                    if (geometryType === "MultiPoint" || geometryType === "Point") {
                        styles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            image: new ol.style.Icon(/** @type {olx.style.IconOptions}*/{
                                anchor: [0.5, 0.5],
                                opacity: 0.80,
                                src: 'img/lake-volta/tree.svg',
                                snapToPixel: false
                            })
                        }));
                    } else if (geometryType === "LineString") {
                        styles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            stroke: new ol.style.Stroke({
                                color: [34, 139, 34, 0.5],
                                width: 6,
                            }),
                        }));
                    }
                }
                return styles;
            };

            lakeVoltaLayer.setStyle(styleFunction);

            //popup inspired by  https://openlayers.org/en/latest/examples/popup.html
/*
            var container = document.getElementById('popup');
            var closer = document.getElementById('popup-closer');
*/


            /**
             * Create an overlay to anchor the popup to the map.
             */
/*
            var overlay = new ol.Overlay(/!** @type {olx.OverlayOptions}*!/{
                element: container,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            });
*/

/*
            closer.onclick = function () {
                overlay.setPosition(undefined);
                closer.blur();
                return false;
            };
*/

            var fitExtentFn;

            var olScope = ctrl.getOpenlayersScope();
            olScope.getMap().then(function (map) {
                map.addLayer(lakeVoltaLayer);
                // map.addOverlay(overlay);

                var listenerKeys = map.on(['click', 'pointermove'], function (e) {
                    var selected = false;
                    var pixel = map.getEventPixel(e.originalEvent);
                    var hitThis = map.hasFeatureAtPixel(pixel, {
                        layerFilter: function (layerCandidate) {
                            return layerCandidate === lakeVoltaLayer;
                        }
                    });

                    map.getTarget().style.cursor = hitThis ? 'pointer' : '';
                    if (e.type === "pointermove") return;

                    if (hitThis) {
                        map.forEachFeatureAtPixel(pixel, function (feature) {
                            selectedFeature = feature;
                            selected = true;

                            LakeVoltaService.showFeatureDetails(selectedFeature.get("mainFeature"), selectedFeature.get("typeFeature"));

/*
                            overlay.setPosition(e.coordinate);
                            var type = selectedFeature.get("type");
                            scope.hazardPos = undefined;
                            scope.hazardPosStart = undefined;
                            scope.hazardPosEnd = undefined;

                            var geometry = selectedFeature.getGeometry();
                            if (geometry.getType() === "LineString") {
                                var start = MapService.toLonLat(geometry.getFirstCoordinate());
                                var end = MapService.toLonLat(geometry.getLastCoordinate());
                                scope.hazardPosStart = {lon: start[0], lat: start[1]};
                                scope.hazardPosEnd = {lon: end[0], lat: end[1]};
                            } else {
                                var lonlat = MapService.toLonLat(geometry.getFirstCoordinate());
                                scope.hazardPos = {lon: lonlat[0], lat: lonlat[1]};
                            }
                            scope.name = selectedFeature.get("description");
                            scope.popupImgSrc = selectedFeature.get("popupImgSrc");
                            scope.popupImgAlt = selectedFeature.get("popupImgAlt");
                            scope.properties = [];

                            if (type === "Characteristics") {
                                scope.properties.push({key: 'Number of visiting outboarder boats', value: selectedFeature.get("Number of visiting outboarder boats")});
                                scope.properties.push({key: 'Design width of approach channel', value: selectedFeature.get("Design width of approach channel")});
                                scope.properties.push({key: 'Weekly passenger transport by boat', value: selectedFeature.get("Weekly passenger transport by boat")});
                                scope.properties.push({key: 'Type of waterborne transport', value: selectedFeature.get("Type of waterborne transport")});
                                scope.properties.push({key: 'Navigational Aids', value: selectedFeature.get("Navigational Aids")});
                                scope.properties.push({key: 'Total population served by location', value: selectedFeature.get("Total population served by location")});
                            } else if (type === "Fairway Characteristics") {
                                scope.properties.push({key: 'Number of visiting outboarder boats', value: selectedFeature.get("Number of visiting outboarder boats")});
                                scope.properties.push({key: 'Design width of approach channel', value: selectedFeature.get("Design width of approach channel")});
                                scope.properties.push({key: 'Weekly passenger transport by boat', value: selectedFeature.get("Weekly passenger transport by boat")});
                                scope.properties.push({key: 'Type of waterborne transport', value: selectedFeature.get("Type of waterborne transport")});
                                scope.properties.push({key: 'Navigational Aids', value: selectedFeature.get("Navigational Aids")});
                                scope.properties.push({key: 'Total population served by location', value: selectedFeature.get("Total population served by location")});
                            } else if (type === "Tree") {
                                scope.properties.push({key: 'Characteristics', value: selectedFeature.get("characteristics")});
                                scope.properties.push({key: 'Estimated number of trees', value: selectedFeature.get("est-number-of-trees")});
                                scope.properties.push({key: 'Size of area to be cleared', value: selectedFeature.get("area-size")});

                            }

                            scope.hasProperties = scope.properties && scope.properties.length > 0;
*/

                        }, /** @type olx.AtPixelOptions */{
                            layerFilter: function (layerCandidate) {
                                return layerCandidate === lakeVoltaLayer;
                            }
                        });
                    }
                    if (!selected) {
                        selectedFeature = undefined;
                    }

                    lakeVoltaLayer.getSource().changed();
                });

                fitExtentFn = function () {
                    if (scope.fitExtent === 'true') {
                        var fitExtent = false;
                        var extent = ol.extent.createEmpty();
                        if (lakeVoltaLayer.getSource().getFeatures().length > 0) {
                            ol.extent.extend(extent, lakeVoltaLayer.getSource().getExtent());
                            fitExtent = true;
                        }
                        if (fitExtent) {
                            map.getView().fit(extent, map.getSize(), {
                                padding: [20, 20, 20, 20],
                                maxZoom: maxZoom
                            });
                        }
                    }

                };

                // Clean up when the scope is destroyed
                scope.$on('$destroy', function () {
                    if (angular.isDefined(lakeVoltaLayer)) {
                        map.removeLayer(lakeVoltaLayer);
                    }
/*
                    if (angular.isDefined(overlay)) {
                        map.removeOverlay(overlay);
                    }
*/
                    if (listenerKeys) {
                        ol.Observable.unByKey(listenerKeys);
                    }
                });
            })
        }
    }
})();