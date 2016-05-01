// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

app.controller('starterCtrl', function($scope, data_service, time_service, map_service, notification_service,
                                      $ionicPopup, $ionicSideMenuDelegate, $ionicModal, 
                                       $ionicLoading, $ionicPlatform)
{
  //json string containing with origins as keys and a list of destinations from that origin as values
  $scope.travel_obj = '{ "Princeton": ["Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"], "Princeton Junction": ["Princeton", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"], "New York Penn Station": ["Princeton", "Princeton Junction", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"], "Newark Airport": ["Princeton", "Princeton Junction", "New York Penn Station", "Philadelphia 30th Street", "Trenton Transit Center"], "Philadelphia 30th Street": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Atlantic City", "Trenton Transit Center"], "Trenton Transit Center": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street"], "Atlantic City": ["Philadelphia 30th Street"]}';

  /* PERMANENT ROUTE FORM VARIABLES */

  $scope.travel_obj = JSON.parse($scope.travel_obj); // all possible routes
  $scope.all_origins = Object.keys($scope.travel_obj) // all possible origins

  /* ORIGIN/DESTINATION VALUES CHOSEN BY USER */

  $scope.from = {value: "Princeton"}; // origin selected by user
  $scope.to = {value: $scope.travel_obj[$scope.from.value][0]}; // destination selected by user
  
  /* DATE VARIABLE CHOSEN BY USER */
  $scope.search_date = {
                          obj: new Date(),
                          string: time_service.get_date_string(new Date()),
                          month: time_service.get_month_name(new Date()),
                          day: time_service.get_day_string(new Date()),
                          year: new Date().getFullYear()
                        }; // search data selected by user -- default today

  /* DATA FROM BACK END */
  $scope.schedules = 'Loading data...'; // retrieved schedules

  // current open card
  $scope.current_card = null;

  /* DATA FOR LIVE VARIABLES */
  $scope.live_data = {arrival_time: null, train_numbers: [], current_num: null, data: ''};

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
    $scope.search_date.string = time_service.get_date_string($scope.search_date.obj);
    $scope.search_date.day =  time_service.get_day_string($scope.search_date.obj);
    $scope.search_date.month =  time_service.get_month_name($scope.search_date.obj);
    $scope.search_date.year =  $scope.search_date.obj.getFullYear();
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
    // set arrival time
    $scope.live_data.arrival_time = time_service.mil_remove_seconds(s['timeEnd']);
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

  function format_times(train_obj)
  {
    train_obj['timeStart_m'] = time_service.mil_to_standard(train_obj['timeStart']);
    train_obj['timeEnd_m'] = time_service.mil_to_standard(train_obj['timeEnd']);
    var transfers = train_obj['transfers'];
    for (var i = 0; i < transfers.length; i++)
    {
      transfers[i]['timeDep_m'] = time_service.mil_to_standard(transfers[i]['timeDep']);
      transfers[i]['timeArr_m'] = time_service.mil_to_standard(transfers[i]['timeArr']);
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
    data_service.get_routes_from_to_on($scope.from.value, $scope.to.value, $scope.search_date.string).then(function(dataResponse) 
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
     data_service.get_live_data($scope.live_data.current_num, $scope.live_data.arrival_time).then(function(dataResponse)
      {
         $scope.live_data.data = dataResponse.data;
         if ($scope.live_data.data == '[]')
         {
            $scope.live_data.data = []
         }
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

  /*************** MODAL STUFF ****************/
  $ionicModal.fromTemplateUrl('templates/my-modal.html', 
  {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) 
  {
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

  /*************** SIDE-MENU STUFF ****************/
  $scope.showMenu = function()
  {
    $ionicSideMenuDelegate.toggleRight();
  }

  /*************** NOTIFICATION STUFF ****************/
  $ionicPlatform.ready(function () 
  {
    // set notifications here
    $scope.schedule_notification = function(place, time)
    {
      notification_service.schedule_notification(place, time);
    }

    $scope.schedule_notification_now = function()
    {
      notification_service.schedule_notification_now($scope.to.value);
    }
    });

  /*************** MAP STUFF ****************/
  $scope.show_map = function(a, b)
  {
    $scope.map = map_service.show_map(a, b)
    //setInterval(2 min, map_service.gps_update())
  }
})

.config(function($stateProvider, $urlRouterProvider) {

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
