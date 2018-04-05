angular.module('maritimeweb.vessel')
/*******************************************************************
 * Controller that handles displaying vessel details in a dialog
 *  Its
 *******************************************************************/
    .controller('VesselDetailsCtrl', ['$scope', '$routeParams', '$window', 'VesselService', 'growl', 'timeAgo', '$filter', '$location', '$rootScope',
        function ($scope, $routeParams, $window, VesselService, growl, timeAgo, $filter, $location, $rootScope) {
            'use strict';

            // console.log("VesselDetailsCtrl routeParams.mmsi=" + $routeParams.mmsi) ;
            $rootScope.showgraphSidebar = false;
            $scope.mmsi = $routeParams.mmsi;
            //$scope.msg = VesselService.detailsMMSI($scope.mmsi);

            VesselService.detailsMMSI($scope.mmsi).then(function(vesselDetails) {
                // console.log('Success: ' + vesselDetails);
                growl.success('Successfully loaded vessel details for mmsi: ' + $scope.mmsi);
                $scope.msg = vesselDetails;

            }, function(reason) {
                growl.error('Failed to load vessel details for mmsi: ' + $scope.mmsi);
                console.log('Failed to get Vessel details for ' + $scope.mmsi);
                console.log(reason);
            });

            /** Returns the lat-lon attributes of the vessel */
            $scope.toLonLat = function (long, lati) {
                return {lon: long, lat: lati};
            };

            var navStatusTexts = {
                0: "Under way using engine",
                1: "At anchor",
                2: "Not under command",
                3: "Restricted manoeuvrability",
                4: "Constrained by her draught",
                5: "Moored",
                6: "Aground",
                7: "Engaged in fishing",
                8: "Under way",
                12: "Power-driven vessel pushing ahead or towing alongside",
                14: "Ais SART",
                15: "Undefined"
            };

            $scope.navStatusText = function (navStatus) {
                if (navStatus && navStatusTexts.hasOwnProperty(navStatus)) {
                    return navStatusTexts[navStatus]
                }
                return null;
            };
        }]);