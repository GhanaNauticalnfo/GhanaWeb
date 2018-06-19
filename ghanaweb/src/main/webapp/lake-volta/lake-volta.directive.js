(function () {
    'use strict';

    angular
        .module('maritimeweb.volta')
        .directive('lakeVoltaLayer', lakeVoltaLayer);

    lakeVoltaLayer.$inject = ['MapService', '$interval'];

    function lakeVoltaLayer(MapService, $interval) {
        var directive = {
            restrict: 'E',
            template: '<div id="popup" class="ol-popup">' +
            '<a href="#" id="popup-closer" class="ol-popup-closer"></a>' +
            '<div id="popup-content">' +
            '<img style="float: left" ng-src="{{popupImgSrc}}" alt="{{popupImgAlt}}"/><p> {{name}}</p>' +
            '<code>{{(hazardPos | lonlat:{ decimals : 2, pp: true })}}</code></div>' +
            '<h5>Details</h5><p>{{details}}</p>' +
            '</div>',
            require: '^olMap',
            scope: {
                features:   '=?'
            },
            link: link
        };
        return directive;

        function link(scope, element, attrs, ctrl) {
            var lakeVoltaLayer = createLakeVoltaLayer();
            var selectedFeature;
            var popupImgSrc = "popupImgSrc";
            var popupImgAlt = "popupImgAlt";


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
                                olFeature.set(popupImgSrc, "img/lake-volta/info40x40.svg", true);
                                olFeature.set(popupImgAlt, "Location Information", true);

                                if (typeFeature.type === "Tree") {
                                    olFeature.set(popupImgSrc, "img/lake-volta/tree40x40.svg", true);
                                    olFeature.set(popupImgAlt, "Tree Stumb Hazard", true);
                                    olFeature.set("description", olFeature.get("characteristics") + ": " + typeHeading, true);
                                    olFeature.set("details", "Size of area to be cleared is " + olFeature.get("area-size") + " and the estimated number of trees to be cut is  " + olFeature.get("est-number-of-trees"), true);
                                }

                                if (typeFeature.type === "Waypoint") {
                                    olFeature.set(popupImgAlt, "Waypoint/Buoy", true);
                                    olFeature.set("description", "Waypoint/Buoy (" + olFeature.get("name") + ")", true);
                                }

                                if (typeFeature.type === "Characteristics") {
                                    olFeature.set(popupImgAlt, "General info", true);
                                    olFeature.set("description", typeHeading, true);
                                }

                                if (typeFeature.type === "Fairway Characteristics") {
                                    olFeature.set(popupImgAlt, "Fairway info", true);
                                    olFeature.set("description", typeHeading + " (" + olFeature.get("LocationIdentifier") + ")" , true);

                                }

                                    lakeVoltaLayer.getSource().addFeature(olFeature);
                            });
                        });
                    });
                }
            }

            var stop = $interval(loadFeatures, 300);


            lakeVoltaLayer.getSource().on("addfeature", function (evt) {
                console.log(evt);
            });

            function createLakeVoltaLayer() {
                var layer = new ol.layer.Vector(/** @type {olx.layer.VectorOptions}*/{
                    // declutter: true,
                    maxResolution: 620,
                    source: new ol.source.Vector()
                });

                return layer;
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
                    styles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                        image: new ol.style.Circle({
                            radius: 3,
                            stroke: new ol.style.Stroke({
                                width: 1,
                                color: 'yellow'
                            }),
                        }),
                        text: new ol.style.Text({
                            text: feature.get('name'),
                            offsetY: 27,
                            fill: new ol.style.Fill({
                                color: '#fff'
                            })
                        })

                    }));
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
                map.addLayer(lakeVoltaLayer);
                map.addOverlay(overlay);

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
                            overlay.setPosition(e.coordinate);
                            var lonlat = MapService.toLonLat(selectedFeature.getGeometry().getFirstCoordinate());
                            scope.hazardPos = {lon: lonlat[0], lat: lonlat[1]};
                            scope.name = selectedFeature.get("description");
                            scope.popupImgSrc = selectedFeature.get("popupImgSrc");
                            scope.popupImgAlt = selectedFeature.get("popupImgAlt");
                            scope.details = selectedFeature.get("details");

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

                // Clean up when the scope is destroyed
                scope.$on('$destroy', function () {
                    if (angular.isDefined(lakeVoltaLayer)) {
                        map.removeLayer(lakeVoltaLayer);
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