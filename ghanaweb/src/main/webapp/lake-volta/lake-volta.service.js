(function () {
    'use strict';

    angular
        .module('maritimeweb.volta')
        .service('LakeVoltaService', LakeVoltaService);

    LakeVoltaService.$inject = ['$http', 'growl', '$q', '$uibModal'];

    function LakeVoltaService($http, growl, $q, $uibModal) {
        this.getFeatures = getFeatures;

        var data;

        function getFeatures() {
            if (data) {
                return $q.when(data);
            } else {
                return $http.get("lake-volta/lake-volta-data.json", {
                    timeout: 60000
                }).then(function (response) {
                    growl.info("Successfully loaded Lake Volta features");
                    data = response.data;
                    return data;
                }).catch(function (response) {
                    growl.error("Failed to load Lake Volta features: " + response.data);
                    $q.reject("Failed to load Lake Volta features");
                });
            }

        }

        /** Open the feature details view **/
        this.showFeatureDetails = function (featureGroup, features) {
            return $uibModal.open({
                controller: "FeatureDetailsViewCtrl",
                templateUrl: "lake-volta/feature-details-view.html",
                size: 'lg',
                resolve: {
                    featureGroup: function () {
                        return featureGroup;
                    },
                    features: function () {
                        return features;
                    }
                }
            });
        };

    }
})();