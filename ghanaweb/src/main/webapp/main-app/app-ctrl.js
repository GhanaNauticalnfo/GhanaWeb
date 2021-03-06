angular.module('maritimeweb.app')

    .controller("AppController", [
        '$scope', '$http', '$window', '$timeout', 'Auth', 'MapService',
        'NwNmService', 'growl', '$uibModal', '$log', 'VesselService','LakeVoltaService',
        function ($scope, $http, $window, $timeout, Auth, MapService, NwNmService, growl, $uibModal, $log, VesselService, LakeVoltaService) {

            // Cancel any pending NW-NN queries
            var loadTimerService = undefined;
            $scope.$on("$destroy", function () {
                if (loadTimerService) {
                    $timeout.cancel(loadTimerService);
                }
            });

            /** Sidemenu collapse handler **/
            $scope.$watch(function(){
                return MapService.sidebarCollapsed; //collapsed state, map-directive -> map-service -> here
            }, function (newValue) {
                $scope.sidebarCollapsed = MapService.sidebarCollapsed;
            });
            $scope.sidebarUncollapse = function(){ //map-directive collapses on map click
                MapService.sidebarUnCollapse(); //is watched to change state in $scope
            };
            /** END Sidemenu collapse handler **/

            $scope.welcomeToBalticWebModal = function (size) {
                $uibModal.open({
                    animation: 'true',
                    templateUrl: 'partials/welcome.html',
                    controller: 'AcceptTermsCtrl',
                    size: size
                })
            };

            $scope.loggedIn = Auth.loggedIn;

            /** Logs the user in via Keycloak **/
            $scope.login = function () {
                Auth.authz.login();
            };

            /** Logs the user out via Keycloak **/
            $scope.logout = function () {
                Auth.authz.logout();
                $window.localStorage.setItem('mmsi', 0);
            };

            /** Returns the user name ,**/
            $scope.userName = function () {
                if (Auth.authz.tokenParsed) {
                    return Auth.authz.tokenParsed.name
                        || Auth.authz.tokenParsed.preferred_username;
                }
                return undefined;
            };

            /** Returns the mrn **/
            $scope.userMrn = function () {
                if (Auth.authz.tokenParsed) {
                    return Auth.authz.tokenParsed;
                }
                return undefined;
            };

            /** Enters the Keycloak account management **/
            $scope.accountManagement = function () {
                Auth.authz.accountManagement();
            };

            // Map state and layers
            $scope.mapState = JSON.parse($window.localStorage.getItem('mapState-storage')) ? JSON.parse($window.localStorage.getItem('mapState-storage')) : {};
            $scope.mapState['reloadMap'] = false;
            $scope.mapBackgroundLayers = MapService.createStdBgLayerGroup();
            $scope.mapMiscLayers = MapService.createStdMiscLayerGroup();
            // $scope.mapSeaMapLayer = MapService.createSuperSeaMapLayerGroup();
            $scope.mcServiceRegistryInstances = [];


            var accepted_terms = $window.localStorage.getItem('terms_accepted_ttl');
            $log.info("accepted_terms ttl = " + accepted_terms);
            var now = new Date();

            if (accepted_terms == null || (new Date(accepted_terms).getTime() < now )) {
                $scope.welcomeToBalticWebModal('lg');
            } else {
                growl.info("Welcome back");
            }


            /**************************************/
            /** Lake Volta functionality         **/
            /**************************************/
            $scope.zoomToLakeVoltaFeatures = function () {
                $scope.mapState.zoom = 9;
                $scope.mapState.center = [0.2, 7.5];
                $scope.mapState['reloadMap'] = true;
            };
            $scope.voltaFeatures = [];
            $scope.voltaDisplayToggle = true;
            $scope.voltaWaypointDisplayToggle = false;

            LakeVoltaService.getFeatures().then(function (features) {
                $scope.voltaFeatures = features;
            }).catch(function (err) {
                $log.error(err);
            });

            $scope.voltaDisplayChanged = function () {
                $scope.voltaDisplayToggle = !$scope.voltaDisplayToggle;
            };

            $scope.voltaWaypointDisplayChanged = function () {
                $scope.voltaWaypointDisplayToggle = !$scope.voltaWaypointDisplayToggle;
            };

            /** Show a detailed view of the feature and the group it belongs to */
            $scope.showFeatureDetails = function (featureGroup, feature) {
                LakeVoltaService.showFeatureDetails(featureGroup, feature);
            };

            /**************************************/
            /** Vessel sidebar functionality      **/
            /**************************************/

            // Vessels
            $scope.vessels = [];
            $scope.vesselsinfo = {};
            $scope.vesselsinfo.maxnumberexceeded = false; // flag to indicate if more vessels are presented than displayed.
            $scope.vesselsinfo.actualnumberofvessels = 0;


            /** Returns the icon to use for the given vessel **/
            $scope.iconForVessel = function (vo) {
                return '/img/' + VesselService.imageAndTypeTextForVessel(vo).name;
            };

            /** Returns the lat-lon attributes of the vessel */
            $scope.toLonLat = function (vessel) {
                return {lon: vessel.x, lat: vessel.y};
            };

            $scope.showVesselDetails = function (vessel) {
                $log.info("mmsi" + vessel);
                VesselService.showVesselInfoFromMMsi(vessel);
                growl.info("Vessel details retrieved");

            };



            /**************************************/
            /** NW-NM sidebar functionality      **/
            /**************************************/

            $scope.nwNmServices = [];
            $scope.satelliteInstances = [];
            $scope.nwNmMessages = [];
            $scope.nwNmLanguage = 'en';
            $scope.nwNmType = {
                NW: $window.localStorage['nwNmShowNw'] != 'false',
                NM: $window.localStorage['nwNmShowNm'] == 'true'
            };

            /**
             * Computes the current NW-NM service boundary
             */
            $scope.currentNwNmBoundary = function () {
                return $scope.mapState['wktextent'];
            };


            /** Schedules reload of the NW-NM services **/
            $scope.refreshNwNmServices = function () {
                if (loadTimerService) {
                    $timeout.cancel(loadTimerService);
                }
                loadTimerService = $timeout(function () {
                    $scope.loadServicesFromRegistry();
                }, 1000);
            };

            // Refresh the service list every time the NW-NM boundary changes
            $scope.$watch($scope.currentNwNmBoundary, $scope.refreshNwNmServices);


            /** Loads the  services **/
            $scope.loadServicesFromRegistry = function () {
                var wkt = $scope.currentNwNmBoundary();
                // var wkt = "POLYGON((-14.475675390625005 40.024168123114805,-14.475675390625005 68.88565248991273,59.92373867187499 68.88565248991273,59.92373867187499 40.024168123114805,-14.475675390625005 40.024168123114805))";

                NwNmService.getNwNmServices(wkt)
                    .then(function (response) {
                        var services = response.data;
                        var status = response.status;
                        //$log.debug("NVNM Status " + status);
                        $scope.nwNmServices.length = 0;

                        // Update the selected status from localstorage
                        var instanceIds = [];
                        if (status === 204) {
                            $scope.nwNmServicesStatus = 'false';
                            $window.localStorage[NwNmService.serviceID()] = 'false';
                            $scope.nwNmMessages = [];

                        }

                        if (status === 200) {
                            $scope.nwNmServicesStatus = 'true';
                            $window.localStorage[NwNmService.serviceID()] = 'true';


                            angular.forEach(services, function (service) {
                                $scope.nwNmServices.push(service);
                                service.selected = $window.localStorage[service.instanceId] == 'true';
                                if (service.selected) {
                                    instanceIds.push(service.instanceId);
                                }
                            });

                            // Load messages for all the selected service instances
                            var mainType = null;
                            if ($scope.nwNmType.NW && !$scope.nwNmType.NM) {
                                mainType = 'NW';
                            } else if (!$scope.nwNmType.NW && $scope.nwNmType.NM) {
                                mainType = 'NM';
                            }
                            if ($window.localStorage[NwNmService.serviceID()]) {
                                NwNmService
                                    .getPublishedNwNm(instanceIds, $scope.nwNmLanguage, mainType, wkt)
                                    .success(function (messages) {
                                        $scope.nwNmMessages = messages;
                                    });
                            }
                        }
                    })
                    .catch(function (response) {
                        var error = response.data;
                        growl.error("Error getting NW NM service from Service Register.");
                        $window.localStorage[NwNmService.serviceID()] = 'false';
                        $scope.nwNmServicesStatus = 'false';

                        $log.debug("Error getting NW NM service. Reason=" + error);
                    })
            };


            /** Called when the NW-NM type selection has been changed **/
            $scope.nwNmTypeChanged = function () {
                $window.localStorage['nwNmShowNw'] = '' + $scope.nwNmType.NW;
                $window.localStorage['nwNmShowNm'] = '' + $scope.nwNmType.NM;
                $scope.loadServicesFromRegistry();
            };


            /** Update the selected status of the service **/
            $scope.nwNmSelected = function (service) {
                $window.localStorage[service.instanceId] = service.selected;
                $scope.loadServicesFromRegistry();
            };


            /** Show the details of the message */
            $scope.showNwNmDetails = function (message) {
                NwNmService.showMessageInfo(message);
            };


            /** Returns the area heading for the message with the given index */
            $scope.nwnmAreaHeading = function (index) {
                var msg = $scope.nwNmMessages[index];
                return NwNmService.getAreaHeading(msg);
            };


            /** Toggle the selected status of the layer **/
            $scope.toggleLayer = function (layer) {
                (layer.getVisible() == true) ? layer.setVisible(false) : layer.setVisible(true); // toggle layer visibility
                if (layer.getVisible()) {
                    growl.info('Activating ' + layer.get('title') + ' layer');
                    $window.localStorage.setItem(layer.get('title'), true);
                }else{
                    $window.localStorage.setItem(layer.get('title'), false);
                }
            };

            /** Toggle the selected status of the service **/
            $scope.toggleService = function (service) {
                service.selected = (service.selected != true); // toggle layer visibility
                if (service.selected) {
                    growl.info('Activating ' + service.name + ' layer');
                }
            };

            /** Toggle the selected status of the service **/
            $scope.switchBaseMap = function (basemap) {
                angular.forEach($scope.mapBackgroundLayers.getLayers().getArray(), function (value) { // disable every basemaps
                    // console.log("disabling " + value.get('title'));
                    value.setVisible(false)
                });
                basemap.setVisible(true);// activate selected basemap
                growl.info('Activating map ' + basemap.get('title'));
            };

            /** Toggle the selected status of the service **/
            $scope.toggleSeaMap = function () {
                $log.debug(" Toogle sea maps");
                if ($scope.loggedIn) {
                    angular.forEach($scope.mapBackgroundLayers.getLayers().getArray(), function (value) { // disable every basemaps
                        // console.log("disabling " + value.get('title'));
                        value.setVisible(false)
                    });
                    angular.forEach($scope.mapSeaMapLayer.getLayers().getArray(), function (value) { // disable/enable every basemaps
                        $log.debug(value + " value.getVisible()=" + value.getVisible());
                        value.setVisible(!value.getVisible());
                        if (!value.getVisible()) {
                            $scope.mapBackgroundLayers.getLayers().getArray()[0].setVisible(true); // default to standard map when disabling
                        }
                    });
                    growl.info('Activating combined nautical chart');
                } else {
                    growl.info("You need to login to access Nautical charts");
                    $scope.mapBackgroundLayers.getLayers().getArray()[0].setVisible(true);
                }
            };

            /** Toggle the selected status of the service **/
            $scope.switchService = function (groupLayers, layerToBeActivated) {
                angular.forEach(groupLayers, function (layerToBeDisabled) { // disable every basemaps
                    layerToBeDisabled.setVisible(false);
                    //$log.debug(" ol disabling " + layerToBeDisabled.get('id'));
                    $window.localStorage.setItem(layerToBeDisabled.get('id'), false);
                });

                layerToBeActivated.selected = (layerToBeActivated.selected != true); // toggle service visibility. if already active
                if (layerToBeActivated.selected) {
                    layerToBeActivated.setVisible(true);// activate selected basemap
                    growl.info('Activating map ' + layerToBeActivated.get('title'));
                    $window.localStorage.setItem(layerToBeActivated.get('id'), true);
                }


            };


            /**
             * store all features in local storage, on a server or right now. Throw them on the root scope.
             */
            $scope.redirectToFrontpage = function () {
                $scope.loading = true;
                $log.debug("redirect to Frontpage");
                var redirect = function () {
                    //$rootScope.showgraphSidebar = true; // rough enabling of the sidebar
                    // TODO use routing...
                    $scope.loading = false;
                    $window.location.href = '#';
                };
                $timeout(redirect, 100);
            };

        }]);

