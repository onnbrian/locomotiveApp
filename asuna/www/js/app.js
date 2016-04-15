// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic'])

app.service('dataService', function($http) 
{
  delete $http.defaults.headers.common['X-Requested-With'];
  this.get_routes_all = function() 
  {
      // $http() returns a $promise that we can add handlers with .then()
      return $http(
      {
          method: 'GET',
          url: 'http://localhost:8000/trainsched/routes_all'
          //params: 'limit=10, sort_by=created:desc',
       });
  }
  this.get_routes_fromto = function(origin, dest)
  {
      // $http() returns a $promise that we can add handlers with .then()
      return $http(
      {
          method: 'GET',
          url: 'http://localhost:8000/trainsched/routes_from_to/' + origin + '/' + dest
       });
  }
});

app.controller('starterCtrl', function($scope, dataService)
{
  $scope.places = ['New York Penn Station', 'Newark Airport', 'Philadelphia 30th Street', 'Princeton']
  $scope.from = '';
  $scope.to = '';
  $scope.searchDate = '...';
  $scope.schedules = 'Loading data...';

  $scope.setFrom = function(originString)
  {
    $scope.from = originString;
  };
  $scope.setTo = function(destString)
  {
    $scope.to = destString;
  };
  $scope.setDate = function(dateString)
  {
    $scope.searchDate = dateString;
  };
  $scope.get_routes_all = function()
  {
    dataService.get_routes_all().then(function(dataResponse) 
      {
         $scope.schedules = dataResponse.data;
      });
  }
  $scope.get_routes_fromto = function(from, to)
  {
    dataService.get_routes_fromto(from, to).then(function(dataResponse) 
      {
         $scope.schedules = dataResponse.data;
         console.log($scope.schedules)
      });
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

    .state('app.schedResults', {
      url: "/schedResults",
      views: {
        'home-view': {
          templateUrl: "templates/scheduleResults.html"
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
