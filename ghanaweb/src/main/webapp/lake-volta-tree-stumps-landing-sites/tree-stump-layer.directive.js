(function () {
    'use strict';

    angular
        .module('maritimeweb.volta')
        .directive('treeStumpLayer', treeStumpLayer);

    treeStumpLayer.$inject = ['MapService'];

    function treeStumpLayer(MapService) {
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
            var treeStumpLayer = createTreeStumpLayer();
            var selectedFeature;
            treeStumpLayer.getSource().on("addfeature", function (evt) {
                var f = evt.feature;
                var name = f.get("name");
                var isTree = name.includes("Tree");
                var isAccessChannel = name.startsWith("Access Channel") && f.getGeometry().getType() === 'LineString';
                var isAccessChannelPoint = name.startsWith("Access Channel") && f.getGeometry().getType() === 'Point';
                var isWaypoint = name.startsWith("WP");
                var isPath = name.startsWith("Pfad ohne Namen");
                addFeatureProperties();
                var newStyleFunc = function (resolution) {
                    var newStyles = [];
                    var isSelected = selectedFeature === f;
                    var font = isSelected ? 'bold 16px Arial' : 'bold 12px Arial';
                    if (isTree) {
                        newStyles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            image: new ol.style.Icon(/** @type {olx.style.IconOptions}*/{
                                anchor: [0.5, 0.5],
                                opacity: 0.80,
                                src: 'img/lake-volta/tree.svg',
                                snapToPixel: false
                            }),

                            zIndex: isSelected ? 2 : 0
                        }));
                    } else if (isAccessChannel) {
                        newStyles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            stroke: new ol.style.Stroke({
                                color: 'red',
                                width: 2,
                                lineDash: [5, 5, 0, 5]
                            }),
                            text: new ol.style.Text(/** @type {olx.style.TextOptions}*/{
                                // textAlign: 'start',
                                font: font,
                                placement: 'line',
                                text: name,
                                fill: new ol.style.Fill({color: 'black'}),
                                stroke: new ol.style.Stroke({color: 'white', width: 3})
                            }),
                            zIndex: isSelected ? 2 : 0
                        }));
                    } else if (isAccessChannelPoint) {
                        newStyles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            image: new ol.style.Circle({
                                radius: 3,
                                stroke: new ol.style.Stroke({
                                    width: 1,
                                    color: 'green'
                                }),
                                fill: new ol.style.Fill({color: 'darkgreen'})
                            }),
                            text: new ol.style.Text(/** @type {olx.style.TextOptions}*/{
                                textAlign: 'start',
                                font: font,
                                text: isSelected ? 'Access channel marker' : "",
                                fill: new ol.style.Fill({color: 'black'}),
                                stroke: new ol.style.Stroke({color: 'white', width: 3})
                            }),
                            zIndex: isSelected ? 2 : 0
                        }));
                    } else if (isWaypoint) {
                        newStyles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            image: new ol.style.Circle({
                                radius: 3,
                                stroke: new ol.style.Stroke({
                                    width: 1,
                                    color: 'yellow'
                                }),
                            }),
                            text: new ol.style.Text(/** @type {olx.style.TextOptions}*/{
                                textAlign: 'start',
                                font: font,
                                text: isSelected ? 'waypoint (' + name + ')' : "",
                                fill: new ol.style.Fill({color: 'black'}),
                                stroke: new ol.style.Stroke({color: 'white', width: 3})
                            }),
                            zIndex: isSelected ? 2 : 0
                        }));
                    } else if (isPath) {
                        newStyles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            stroke: new ol.style.Stroke({
                                color: 'red',
                                width: 2,
                                lineDash: [5, 5, 0, 5]
                            })
                        }));
                    } else {
                        newStyles.push(new ol.style.Style(/** @type {olx.style.StyleOptions}*/{
                            image: new ol.style.Circle({
                                radius: 3,
                                stroke: new ol.style.Stroke({
                                    width: 2,
                                    color: 'black'
                                }),
                                fill: new ol.style.Fill({
                                    color: 'black'
                                })
                            }),
                            text: new ol.style.Text(/** @type {olx.style.TextOptions}*/{
                                textAlign: 'start',
                                font: font,
                                text: name,
                                fill: new ol.style.Fill({color: 'black'}),
                                stroke: new ol.style.Stroke({color: 'white', width: 3}),
                                offsetX: 10,
                                offsetY: 0,
                                rotation: 0
                            }),
                            zIndex: isSelected ? 2 : 1
                        }));
                    }

                    // var styles = styleFunc.apply(f, [resolution]);
/*
                    styles.forEach(function (style) {
                        var scale = 1.0;
                        var image = style.getImage();
                        if (image) {
                            newStyles.push(style);
                            scale = image.getScale() > 1 ? image.getScale() : 1.0;
                            if (resolution < 1.0) {
                                scale = 0.95 * scale;
                            } else if (resolution < 2.0) {
                                scale = 0.9 * scale;
                            } else if (resolution < 8.0) {
                                scale = 0.8 * scale;
                            } else if (resolution < 19.0) {
                                scale = 0.7 * scale;
                            } else if (resolution < 38.0) {
                                scale = 0.6 * scale;
                            } else if (resolution < 76.0) {
                                scale = 0.5 * scale;
                            } else if (resolution < 150.0) {
                                scale = 0.4 * scale;
                            } else if (resolution < 600.0) {
                                scale = 0.35 * scale;
                            } else if (resolution < 1200.0) {
                                scale = 0.3 * scale;
                            } else if (resolution < 2400.0) {
                                scale = 0.2 * scale;
                            } else if (resolution < 4800.0) {
                                scale = 0.18 * scale;
                            } else if (resolution < 9000.0) {
                                scale = 0.15 * scale;
                            } else if (resolution < 18000.0) {
                                scale = 0.12 * scale;
                            } else {
                                scale = 0.1 * scale;
                            }
                            image.setScale(scale);
                        }
                        var text = style.getText();
                        if (text) {
                            if (resolution < 45 || selectedFeature === f) {
                                if (selectedFeature === f) {
                                    style = style.clone();
                                    style.getText().getFill().setColor("black");
                                    style.getText().setScale(1.0);
                                }

                                newStyles.push(style);
                            }
                            if (resolution > 40) {
                                text.setScale(0.70);
                            } else if (resolution > 35) {
                                text.setScale(0.75);
                            } else if (resolution > 20) {
                                text.setScale(0.85);
                            } else {
                                text.setScale(0.9);
                            }

                        }
                    });
*/
                    return newStyles;
                };
                f.setStyle(newStyleFunc);

                function addFeatureProperties() {
                    var popupImgSrc = "popupImgSrc";
                    var popupImgAlt = "popupImgAlt";

                    f.set(popupImgSrc, "img/lake-volta/info40x40.svg");
                    f.set(popupImgAlt, "Location Information");
                    f.set("description", name);

                    if (isTree) {
                        f.set(popupImgSrc, "img/lake-volta/tree40x40.svg");
                        f.set(popupImgAlt, "Tree Stumb Hazard");
                        f.set("description", "Tree Stumb Hazard");
                    }
                    if (isWaypoint) {
                        f.set("description", "Waypoint (" + name + ")");
                    }
                    if (isPath) {
                        f.set("description", "A path");
                    }
                    if (isAccessChannelPoint) {
                        f.set("description", "Access channel marker");
                    }
                }
            });
            function createTreeStumpLayer() {
                var layer = new ol.layer.Vector(/** @type {olx.layer.VectorOptions}*/{
                    declutter: true,
                    maxResolution: 620,
                    source: new ol.source.Vector(/** @type {olx.source.VectorOptions}*/{
                        url: 'lake-volta-tree-stumps-landing-sites/tree-stumps-and-landing-sites.kml',
                        format: new ol.format.KML(),
                        overlaps: false
                    })
                });

                return layer;
            }

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

            closer.onclick = function() {
                overlay.setPosition(undefined);
                closer.blur();
                return false;
            };


            var olScope = ctrl.getOpenlayersScope();
            olScope.getMap().then(function (map) {
                map.addLayer(treeStumpLayer);
                map.addOverlay(overlay);

                var listenerKeys = map.on(['click', 'pointermove'], function(e) {
                    var selected = false;
                    var pixel = map.getEventPixel(e.originalEvent);
                    var hitThis = map.hasFeatureAtPixel(pixel, {
                        layerFilter: function (layerCandidate) {
                            return layerCandidate === treeStumpLayer;
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

                            console.log(scope.popupImgSrc);
                            console.log(scope.popupImgAlt);
                        }, /** @type olx.AtPixelOptions */{
                            layerFilter: function (layerCandidate) {
                                return layerCandidate === treeStumpLayer;
                            }
                        });
                    }
                    if (!selected) {
                        selectedFeature = undefined;
                    }

                    treeStumpLayer.getSource().changed();
                });

                // Clean up when the scope is destroyed
                scope.$on('$destroy', function () {
                    if (angular.isDefined(treeStumpLayer)) {
                        map.removeLayer(treeStumpLayer);
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