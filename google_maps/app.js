// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var example = angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

 function init()
        {
        return initMapLocations("Princeton Junction", "New York Penn Station");
      }

      function fixNames(location){
          var start = "Princeton Station";
          if (location == "Princeton Junction")
              start = "LV Princeton Junction";
          else if (location == "New York Penn Station")
              start = "Pennsylvania Station";
          else if (location == "Philadelphia 30th Street")
              start = "30th Street Station";
          else if (location == "Trenton Transit")
              start = "Trenton Transit Center";
          else if (location == "Newark Airport")
              start = "Amtrak Station - EWR";
          else if (location == "Atlantic City")
              start = "Atlantic City";
          return start;
      }

      function initMapLocations(location1, location2) {

        var start = fixNames(location1);
        var end = fixNames(location2);

        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          center: {lat: 40.340166, lng: -74.657889}
        });
        directionsDisplay.setMap(map);
        calculateAndDisplayRoute(start, end, directionsService, directionsDisplay);
        putGPSonMap(map);
        return map;
      } 

      function putGPSonMap(map){
          var image = {
          url: 'https://cdn0.iconfinder.com/data/icons/world-issues/500/running_man-64.png',
    // This marker is 20 pixels wide by 32 pixels high.
          size: new google.maps.Size(64, 64),
    // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(32, 48)
        };

          var marker = new google.maps.Marker({map: map, icon:image, animation: google.maps.Animation.BOUNCE});
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            marker.setPosition(pos);
            //infoWindow.setContent('Location found.');
           // map.setCenter(pos);
          }, function() {
            handleLocationError(true, marker, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, marker, map.getCenter());
        }
      }

      function calculateAndDisplayRoute(location1, location2, directionsService, directionsDisplay) {
        directionsService.route({
          origin: location1,
          destination: location2,
          travelMode: google.maps.TravelMode.TRANSIT
        }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }

example.controller('MapController', function($scope, $ionicLoading) {
 
    google.maps.event.addDomListener(window, 'load', function() {
        map = init();
        $scope.map = map;
    });
 
});