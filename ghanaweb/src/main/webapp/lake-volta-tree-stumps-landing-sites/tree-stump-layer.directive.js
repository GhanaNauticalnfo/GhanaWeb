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
            treeStumpLayer.getSource().on("addfeature", function (evt) {
                var f = evt.feature;
                var styleFunc = f.getStyle();

                var newStyleFunc = function (resolution) {
                    // console.log("resolution: " + resolution);
                    var styles = styleFunc.apply(f, [resolution]);
                    styles.forEach(function (style) {
                        var scale = 1.0;
                        var image = style.getImage();
                        if (image) {
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
                            if (resolution > 500) {
                                text.setScale(0.15);
                            } else if (resolution > 350) {
                                text.setScale(0.35);
                            } else if (resolution > 100) {
                                text.setScale(0.55);
                            } else {
                                text.setScale(0.8);
                            }

                        }
                    });
                    return styles;
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

                map.on('click', function(evt) {
                    var features = [];
                    map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                        features.push(feature);
                    });
                    if (features.length > 0) {
                        features.forEach(function (f) {
                            // console.log(f.getKeys());
                            f.getKeys().forEach(function (k) {
                                // console.log(f.get(k));
                            });
                        });
                    }
                });

                // Clean up when the scope is destroyed
                scope.$on('$destroy', function () {
                    if (angular.isDefined(treeStumpLayer)) {
                        map.removeLayer(treeStumpLayer);
                    }
/*
                    if (onclickKey) {
                        ol.Observable.unByKey(onclickKey);
                    }
*/
                });
            })
        }
    }
})();