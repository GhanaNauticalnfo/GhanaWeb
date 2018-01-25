(function () {
    'use strict';

    angular
        .module('maritimeweb.volta')
        .directive('treeStumpLayer', treeStumpLayer);

    treeStumpLayer.$inject = [];

    function treeStumpLayer() {
        var directive = {
            restrict: 'E',
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
                var styleFunc = f.getStyle();

                var newStyleFunc = function (resolution) {
                    // console.log("resolution: " + resolution);
                    var newStyles = [];
                    var styles = styleFunc.apply(f, [resolution]);
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
                    return newStyles;
                };
                if (styleFunc) {
                    f.setStyle(newStyleFunc);
                }

            });
            function createTreeStumpLayer() {
                var layer = new ol.layer.Vector({
                    declutter: true,
                    maxResolution: 620,
                    source: new ol.source.Vector({
                        url: 'lake-volta-tree-stumps-landing-sites/tree-stumps-and-landing-sites.kml',
                        format: new ol.format.KML()
                    })
                });

                return layer;
            }

            var olScope = ctrl.getOpenlayersScope();
            olScope.getMap().then(function (map) {
                map.addLayer(treeStumpLayer);

                var onClickKey = map.on('click', function(e) {
                    var selected = false;
                    var pixel = map.getEventPixel(e.originalEvent);
                    var hitThis = map.hasFeatureAtPixel(pixel, {
                        layerFilter: function (layerCandidate) {
                            return layerCandidate === treeStumpLayer;
                        }
                    });

                    if (hitThis) {
                        map.forEachFeatureAtPixel(pixel, function (feature) {
                            selectedFeature = feature;
                            selected = true;
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
                    if (onClickKey) {
                        ol.Observable.unByKey(onClickKey);
                    }
                });
            })
        }
    }
})();