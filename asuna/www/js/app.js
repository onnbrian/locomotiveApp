// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])

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

app.controller('starterCtrl', function($scope, $location, $anchorScroll, $ionicScrollDelegate, $ionicPopup, $ionicPosition, $ionicSideMenuDelegate, $ionicModal, $ionicBackdrop, $http, dataService)
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
  $scope.train_numbers = [];
  $scope.live_train_data = '';

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
  $scope.setTrains = function(s)
  {
    // reset train array
    $scope.train_numbers = [];
    // get all train names
    $scope.train_numbers.push(s["trainName"]);
    var transfers = s['transfers'];
    for (var i = 0; i < transfers.length; i++)
    {
      $scope.train_numbers.push(transfers[i]["trainName"]);
    }

    // parse names to get numbers
    for (var i = 0; i < $scope.train_numbers.length; i++)
    {
      $scope.train_numbers[i] = parse_train_num($scope.train_numbers[i]);
    }
  };

  /********************** HTTP REQUESTS FOR DATA ***********************/

  // get route data from server
  // SCOPE VARIABLES USED: <from.value> <to.value> <date_string> <schedules>
  $scope.get_routes_from_to_on = function()
  {
    dataService.get_routes_from_to_on($scope.from.value, $scope.to.value, $scope.date_string).then(function(dataResponse) 
      {
         $scope.schedules = dataResponse.data;
      });
  }

  // get live scraped data from server
  // SCOPE VARIABLES USED: <live_train-data>
  $scope.get_live_data = function(train_number)
  {
     dataService.get_live_data(train_number).then(function(dataResponse) 
      {
         $scope.live_train_data = dataResponse.data;
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
    //$ionicBackdrop.retain();
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() 
  {
    //$ionicBackdrop.release();
    $scope.modal.remove();
    $ionicScrollDelegate.$getByHandle('resetModalScroll').forgetScrollPosition(true);
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
