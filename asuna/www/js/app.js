// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

app.service('dataService', function($http) 
{
  delete $http.defaults.headers.common['X-Requested-With'];

  this.get_routes_from_to_on = function(origin, dest, dateString)
  {
      // $http() returns a $promise that we can add handlers with .then()
      return $http(
      {
          method: 'GET',
          //url: 'http://localhost:8000/trainsched/routes_from_to_on/' + origin + '/' + dest + '/' + dateString
          url: 'http://54.165.156.225:8000/trainsched/routes_from_to_on/' + origin + '/' + dest + '/' + dateString
       });
  }

  this.get_live_data = function(train_number)
  {
      // $http() returns a $promise that we can add handlers with .then()
      return $http(
      {
          method: 'GET',
          //url: 'http://localhost:8000/trainsched/live_data_get/' + train_number
          url: 'http://54.165.156.225:8000/trainsched/live_data_get/' + train_number
       });
  }


});

app.controller('starterCtrl', function($scope, dataService, $http, $cordovaLocalNotification, $ionicPopup, $ionicSideMenuDelegate, $ionicModal, $ionicLoading, $ionicPlatform)
{
  // json string containing with origins as keys and a list of destinations from that origin as values
  $scope.travel_obj = '{ "Princeton": ["Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"], "Princeton Junction": ["Princeton", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"], "New York Penn Station": ["Princeton", "Princeton Junction", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"], "Newark Airport": ["Princeton", "Princeton Junction", "New York Penn Station", "Philadelphia 30th Street", "Trenton Transit Center"], "Philadelphia 30th Street": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Atlantic City", "Trenton Transit Center"], "Trenton Transit Center": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street"], "Atlantic City": ["Philadelphia 30th Street"]}';
  // list of month strings
  $scope.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  /* PERMANENT ROUTE FORM VARIABLES */

  $scope.travel_obj = JSON.parse($scope.travel_obj); // all possible routes
  $scope.all_origins = Object.keys($scope.travel_obj) // all possible origins

  /* ORIGIN/DESTINATION VALUES CHOSEN BY USER */

  $scope.from = {value: "Princeton"}; // origin selected by user
  $scope.to = {value: $scope.travel_obj[$scope.from.value][0]}; // destination selected by user
  
  /* DATE VARIABLES CHOSEN BY USER */

  $scope.search_date = {value:new Date()}; // search data selected by user -- default today
  $scope.year = null; // search year selected by user
  $scope.month = null; // search month selected user
  $scope.month_name = null; // search month as string
  $scope.day = null; // search day selected by user
  $scope.date_string = null; // search date as string for database search

  /* DATA FROM BACK END */

  $scope.schedules = 'Loading data...'; // retrieved schedules

  // current open card
  $scope.current_card = null;
  $scope.i = 0;
  $scope.process = null;

  /* DATA FOR LIVE VARIABLES */
  $scope.live_data = {train_numbers: [], current_num: null, data: ''};

  function inArray(value, array)
  {
    return array.indexOf(value) > -1;
  }

  /************ FUNCTIONS TO SET CONTROLLER VARIABLES **************/

  // if the origin changes, ensure destination has to acceptable value
  // SCOPE VARIABLES USED: <travel_obj> <to.value> <from.value>
  $scope.update_dest_val = function()
  {
    // no need to update
    if (inArray($scope.to.value, $scope.travel_obj[$scope.from.value]))
    {
      return;
    }
    else
    {
      $scope.to.value = $scope.travel_obj[$scope.from.value][0]
    }
  }

  // set date variables after date is picked
  // SCOPE VARIABLES USED: <month_name> <month> <day> <year> <date_string>
  $scope.setDateVars = function()
  {
    $scope.month_name = $scope.months[$scope.search_date.value.getMonth()];
    $scope.month = $scope.search_date.value.getMonth()+1;
    $scope.day = $scope.search_date.value.getDate();
    $scope.year = $scope.search_date.value.getFullYear();

    if ($scope.day < 10)
      $scope.day = '0' + $scope.day
    if ($scope.month < 10)
      $scope.month = '0' + $scope.month


    // need to handle local vs utc timezones
    $scope.date_string = $scope.year + '-' + $scope.month + '-' + $scope.day;
  };

  // helper function to get train numbers from train name
  function parse_train_num(train_string)
  {
    var words = train_string.split(" ");
    var num = words[words.length - 1];
    return num.substr(1);
  }

  // get train numbers from selected car for live scraping
  // SCOPE VARIABLES USED: <train_numbers>
  $scope.set_live_data = function(s)
  {
    // reset train array
    $scope.live_data.train_numbers = [];
    // get all train names
    $scope.live_data.train_numbers.push(s["trainName"]);
    var transfers = s['transfers'];
    for (var i = 0; i < transfers.length; i++)
    {
      $scope.live_data.train_numbers.push(transfers[i]["trainName"]);
    }

    // parse names to get numbers
    for (var i = 0; i < $scope.live_data.train_numbers.length; i++)
    {
      $scope.live_data.train_numbers[i] = parse_train_num($scope.live_data.train_numbers[i]);
    };

    // set current train number
    $scope.live_data.current_num = $scope.live_data.train_numbers[0]

    // get data
    $scope.get_live_data();
  };

  /********************** HTTP REQUESTS FOR DATA ***********************/

  function milToStandard(value) {
    if (value !== null && value !== undefined){ //If value is passed in
      if(value.indexOf('AM') > -1 || value.indexOf('PM') > -1){ //If time is already in standard time then don't format.
        return value;
      }
      else 
      {
        if(value.length == 8)
        { //If value is the expected length for military time then process to standard time.
          var hour = value.substring ( 0,2 ); //Extract hour
          var minutes = value.substring ( 3,5 ); //Extract minutes
          var identifier = 'AM'; //Initialize AM PM identifier
   
          if(hour == 12){ //If hour is 12 then should set AM PM identifier to PM
            identifier = 'PM';
          }
          if(hour == 0){ //If hour is 0 then set to 12 for standard time 12 AM
            hour=12;
          }
          if(hour > 12){ //If hour is greater than 12 then convert to standard 12 hour format and set the AM PM identifier to PM
            hour = hour - 12;
            identifier='PM';
          }
          hour = String(hour)
          if ((hour.length == 2) && hour.charAt(0) == '0')
          {
            hour = hour.charAt(1);
          }

          return hour + ':' + minutes + ' ' + identifier; //Return the constructed standard time
        }
        else 
        { //If value is not the expected length than just return the value as is
          return value;
        }
      }
    }
  };

  function format_times(train_obj)
  {
    train_obj['timeStart'] = milToStandard(train_obj['timeStart']);
    train_obj['timeEnd'] = milToStandard(train_obj['timeEnd']);
    var transfers = train_obj['transfers'];
    for (var i = 0; i < transfers.length; i++)
    {
      transfers[i]['timeDep'] = milToStandard(transfers[i]['timeDep']);
      transfers[i]['timeArr'] = milToStandard(transfers[i]['timeArr']);
    }
    return;
  }

  // get route data from server
  // SCOPE VARIABLES USED: <from.value> <to.value> <date_string> <schedules>
  $scope.get_routes_from_to_on = function()
  {
    $ionicLoading.show(
    {
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: false,
      maxWidth: 200,
      showDelay: 0
    });
    dataService.get_routes_from_to_on($scope.from.value, $scope.to.value, $scope.date_string).then(function(dataResponse) 
      {
        var raw_schedules = dataResponse.data;
        for (i = 0; i < raw_schedules.length; i++)
        {
          format_times(raw_schedules[i]);
        }
         $scope.schedules = raw_schedules;
         $ionicLoading.hide();
      });
  }

  // get live scraped data from server
  // SCOPE VARIABLES USED: <live_train-data>
  $scope.get_live_data = function()
  {
    $ionicLoading.show(
    {
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: false,
      maxWidth: 200,
      showDelay: 0
    });
     dataService.get_live_data($scope.live_data.current_num).then(function(dataResponse) 
      {
         $scope.live_data.data = dataResponse.data;
         $ionicLoading.hide();
      });   
  }

  /*************** CARD MANIPULATION ****************/

  $scope.change_cards = function(sched, show)
  {
    // open, so close it
    if (show.settings)
    {
      $scope.current_card = null;
      show.settings = false;
    }
    // closed, so open it
    else
    {
      // check if another card is open -- if so close it
      if ($scope.current_card != null)
      {
        $scope.current_card.show.settings = false;
      }
      show.settings = true;
      $scope.current_card = {show: show, info: sched}
    }
    return;
  }

  // POP OVER STUFF
  // Triggered on a button click, or some other target
  $scope.showPopup = function() 
  {
    $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show(
      {
        templateUrl: 'my-popup.html',
        title: 'Select a Train',
        subTitle: 'Get Live Route Data',
        scope: $scope,
        buttons: [ { text: 'Cancel'} ]
      });

      $scope.sendOrder = function()
      {
        myPopup.close();
      };
    };

    // MODAL STUFF
    $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() 
  {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() 
  {
    $scope.modal.remove();
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() 
  {
    //$ionicBackdrop.release();
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() 
  {
    //$ionicBackdrop.release();
    // Execute action
  });

    // SIDE MENU STUFF


  $scope.showMenu = function()
  {
    $ionicSideMenuDelegate.toggleRight();
  }

    // PROCESS TESTING

  $scope.set_notification = function(location, time)
  {
    alert(location + " " + time);
  }

  $scope.intervalAlerts = function()
  {
    if ($scope.process == null)
    {
      alert($scope.i)
      alert("start em up")
      $scope.process = setInterval(function() {$scope.i++; console.log($scope.i)}, 1000);
    }
    else
    {
      alert("ending process");
      $scope.i = 0;
      clearInterval($scope.process);
      $scope.process = null;
    }
  }

  $scope.showme = function()
  {
    alert($scope.i);
  }

  // LOCATION NOTIFICATIONS
  $ionicPlatform.ready(function () 
  {
    $scope.scheduleSingleNotification = function () 
    {
      if (ionic.Platform.isWebView()) 
      {
        $cordovaLocalNotification.schedule(
        {
          id: 1,
          title: 'Warning',
          text: 'Youre so sexy!',
          data: {
            customProperty: 'custom value'
                }
        })
        .then(function (result) 
        {
          console.log('Notification 1 triggered');
        });
      }
    };
  });

  // MAPS

    function fixNames(location)
    {
        var start = "Princeton Station, NJ";
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
        console.log(start)
        console.log(end)
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

    google.maps.event.addDomListener(window, 'load', function() 
    {
        map = initMapLocations("Princeton", "Princeton Junction");
        $scope.map = map;
    });

})

app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/background.html"
    })

    .state('app.home', {
      url: "/home",
      templateUrl: "templates/home.html",
      views: {
        'home-view': {
          templateUrl: "templates/home.html"
        }
      }
    })

    .state('app.schedResults', {
      url: "/schedResults",
      views: {
        'home-view': {
          templateUrl: "templates/scheduleResults.html"
        }
      }
    })

    .state('app.liveData', {
      url: "/liveData",
      views: {
        'home-view': {
          templateUrl: "templates/liveData.html"
        }
      }
    })

    .state('app.map', {
      url: "/map",
      views: {
        'home-view': {
          templateUrl: "templates/map.html"
        }
      }
    })

   $urlRouterProvider.otherwise("/app/home");

})

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
