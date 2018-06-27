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
                features:         '=?',
                featureGroup:     '=?',
                fitExtent:        '@',
                maxZoom:          '@',
                displayLayer:     '=?',
                displayWaypoints: '=?'
            },
            link: link
        };
        return directive;

        function link(scope, element, attrs, ctrl) {
            var lakeVoltaLayer = createLakeVoltaLayer();
            var maxZoom = scope.maxZoom ? parseInt(scope.maxZoom) : 12;
            var selectedFeature;
            var showDetail = !!scope.featureGroup;


            function loadFeatures() {
                if (scope.features) {
                    lakeVoltaLayer.getSource().clear();
                    scope.features.forEach(function (feature) {
                        addFeature(feature);
                    });
                }
            }

            function addFeature(feature) {
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

            }

            function createLakeVoltaLayer() {
                return new ol.layer.Vector(/** @type {olx.layer.VectorOptions}*/{
                    // declutter: true,
                    maxResolution: 620,
                    source: new ol.source.Vector()
                });
            }

            var colorMap = {};
            var colors = [
                "#008000",
                "#FF0000",
                "#FFA500",
                "#FFFF00",
                "#000000",
                "#C0C0C0",
                "#808080"
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
                            })
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
                            })
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
                        if (scope.displayWaypoints) {
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
                        } else {
                            styles.push(new ol.style.Style({}));
                        }
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
                                width: 6
                            })
                        }));
                    }
                }
                return styles;
            };

            lakeVoltaLayer.setStyle(styleFunction);

            var olScope = ctrl.getOpenlayersScope();
            olScope.getMap().then(function (map) {
                map.addLayer(lakeVoltaLayer);

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

                scope.reload = function () {
                    loadFeatures();
                    scope.fitExtentFn();
                };

                scope.changeLayerVisibility = function () {
                    lakeVoltaLayer.setVisible(scope.displayLayer);
                };

                scope.changeWaypointVisibility = function () {
                    lakeVoltaLayer.getSource().changed();
                };

                scope.fitExtentFn = function () {
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

                if (showDetail) {
                    addFeature(scope.featureGroup);
                    scope.fitExtentFn();
                } else {
                    // Listen for changes that should cause updates to the layers
                    scope.$watch("features", scope.reload, true);
                    scope.$watch("displayLayer", scope.changeLayerVisibility, true);
                    scope.$watch("displayWaypoints", scope.changeWaypointVisibility, true);
                }


                // Clean up when the scope is destroyed
                scope.$on('$destroy', function () {
                    if (angular.isDefined(lakeVoltaLayer)) {
                        map.removeLayer(lakeVoltaLayer);
                    }
                    if (listenerKeys) {
                        ol.Observable.unByKey(listenerKeys);
                    }
                });
            })
        }
    }
})();