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
          url: 'http://localhost:8000/trainsched/live_data_get/' + train_number
          //url: 'http://54.165.156.225:8000/trainsched/routes_from_to_on/' + origin + '/' + dest + '/' + dateString
       });
  }


});

app.controller('starterCtrl', function($scope, $location, $anchorScroll, $ionicScrollDelegate, $ionicPopup, $ionicPosition, $ionicSideMenuDelegate, $http, dataService)
{
  // json string containing with origins as keys and a list of destinations from that origin as values
  $scope.travel_obj = '{ "Princeton": ["New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"], "New York Penn Station": ["Princeton", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"], "Newark Airport": ["New York Penn Station", "Princeton", "Philadelphia 30th Street", "Trenton Transit Center"], "Philadelphia 30th Street": ["New York Penn Station", "Princeton", "Newark Airport", "Atlantic City", "Trenton Transit Center"], "Trenton Transit Center": ["Princeton", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street"], "Atlantic City": ["Philadelphia 30th Street"] }';
  $scope.travel_obj = JSON.parse($scope.travel_obj);
  // get all origin (keys)
  $scope.all_origins = Object.keys($scope.travel_obj)
  // origin selected by user
  $scope.from = null;
  // destination selected by user
  $scope.to = null;
  // search data selected by user -- default today
  $scope.searchDate = {value:new Date()};
  // search year selected by user
  $scope.year = null;
  // search month selected user
  $scope.month = null;
  // search day selected by user
  $scope.day = null;
  // retrieved schedules
  $scope.schedules = 'Loading data...';

  // current open card
  $scope.current_card = null;
  $scope.i = 0;
  $scope.process = null;
  $scope.train_numbers = [];
  $scope.live_train_data = 'Loading data...';

  // FUNCTIONS TO SET CONTROLLER VARIABLES

  $scope.setFrom = function(originString)
  {
    $scope.from = originString;
  };
  $scope.setTo = function(destString)
  {
    $scope.to = destString;
  };
  $scope.setDateVars = function()
  {
    $scope.month = $scope.searchDate.value.getMonth()+1;
    $scope.day = $scope.searchDate.value.getDate();
    $scope.year = $scope.searchDate.value.getFullYear();

    if ($scope.day < 10)
      $scope.day = '0' + $scope.day
    if ($scope.month < 10)
      $scope.month = '0' + $scope.month


    // need to handle local vs utc timezones
    $scope.dateString = $scope.year + '-' +$scope.month + '-' + $scope.day;
    console.log($scope.dateString)
  };

  function parse_train_num(train_string)
  {
    var words = train_string.split(" ");
    var num = words[words.length - 1];
    return num.substr(1);
  }

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

  // HTTP REQUESTS FOR DATA

  $scope.get_routes_all = function()
  {
    dataService.get_routes_all().then(function(dataResponse) 
      {
         $scope.schedules = dataResponse.data;
      });
  }
  $scope.get_routes_from_to = function(from, to)
  {
    dataService.get_routes_from_to(from, to).then(function(dataResponse) 
      {
         $scope.schedules = dataResponse.data;
      });
  }

  $scope.get_routes_from_to_on = function(from, to, dateString)
  {
    dataService.get_routes_from_to_on(from, to, dateString).then(function(dataResponse) 
      {
         $scope.schedules = dataResponse.data;
      });
  }

  $scope.get_live_data = function(train_number)
  {
     dataService.get_live_data(train_number).then(function(dataResponse) 
      {
         $scope.live_train_data = dataResponse.data;
         console.log("hi")
      });   
  }

  // CARDS STUFF
  $scope.jumpToCard = function(quote) 
  {
    console.log(quote);
    $scope.quoteSelected = quote;
    var quotePosition = $ionicPosition.position(angular.element(document.getElementById('card-'+quote.id)));
    $ionicScrollDelegate.scrollTo(quotePosition.left, quotePosition.top, true);
  }

  $scope.goToAnchor = function(x) 
  {
      var newHash = 'anchor' + x.card_ID;
      console.log(newHash);
      $location.hash(newHash);
      $ionicScrollDelegate.anchorScroll(true);
      //$ionicScrollDelegate.scrollBy(0, 100);

      /*
      if ($location.hash() !== newHash) {
        // set the $location.hash to `newHash` and
        // $anchorScroll will automatically scroll to it
        $location.hash('anchor' + x.card_ID);
      } else {
        // call $anchorScroll() explicitly,
        // since $location.hash hasn't changed
        $ionicScrollDelegate.anchorScroll();
      }
      */
  };

  $scope.flip_card = function(show)
  {
    // open, so close it
    if (show.settings)
    {
      if (show.card_ID != $scope.current_card.card_ID)
      {
        alert("SHOULDN'T HAPPEN");
      }
      console.log("hi");
      $scope.current_card = null;
      show.transfers = false;
      show.settings = false;
    }
    // closed, so open it
    else
    {
      // check if another card is open -- if so close it
      if ($scope.current_card != null)
      {
        $scope.current_card.transfers = false;
        $scope.current_card.settings = false;
      }
      $scope.current_card = show;
      show.settings = true;
      //$scope.goToAnchor(show);
    }
    return;
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


  $scope.showMenu = function()
  {
    $ionicSideMenuDelegate.toggleRight();
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

    .state('app.origin', {
      url: "/origin",
      views: {
        'home-view': {
          templateUrl: "templates/origin.html"
        }
      }
    })

    .state('app.dest', {
      url: "/dest",
      views: {
        'home-view': {
          templateUrl: "templates/destination.html"
        }
      }
    })

    .state('app.searchDate', {
      url: "/searchDate",
      views: {
        'home-view': {
          templateUrl: "templates/pickDate.html"
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
