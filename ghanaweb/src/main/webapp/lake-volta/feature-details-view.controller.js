(function () {
    'use strict';

    angular
        .module('maritimeweb.volta')
        .controller("FeatureDetailsViewCtrl", FeatureDetailsViewCtrl);

    FeatureDetailsViewCtrl.$inject = ['$scope', 'featureGroup', 'features'];

    function FeatureDetailsViewCtrl($scope, featureGroup, features) {
        $scope.features = featureGroup;
        $scope.featureDetail = features;
        $scope.imageSrc = "img/lake-volta/info40x40.svg";
        $scope.imageAlt = "img/lake-volta/info40x40.svg";
        if ($scope.featureDetail.type === "Tree") {
            $scope.imageSrc = "img/lake-volta/tree40x40.svg";
            $scope.imageAlt = "Tree Stumb Hazard";
        }

        if ($scope.featureDetail.type === "Waypoint") {
            $scope.imageAlt = "Waypoint/Buoy";
        }

        if ($scope.featureDetail.type === "Characteristics") {
            $scope.imageAlt = "General info";
        }

        if ($scope.featureDetail.type === "Fairway Characteristics") {
            $scope.imageAlt = "Fairway info";
        }
    }
})();