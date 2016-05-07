// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

app.controller('starterCtrl', function($scope, data_service, time_service, map_service, notification_service, $state,
                                      $ionicPopup, $ionicSideMenuDelegate, $ionicModal, $ionicPopover,
                                      $ionicLoading, $ionicPlatform, $cordovaLocalNotification, $rootScope)
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
  $scope.schedules = []; // retrieved schedules

  // current open card
  $scope.current_card = null;

  /* DATA FOR LIVE VARIABLES */
  $scope.live_data = {
                        date: null,
                        schedule: null,
                        train_numbers: [], 
                        current_num: null, 
                        data: []
                     };

  $scope.all_notifications = [];

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
    console.log($scope.search_date.string)
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
  $scope.set_live_data = function(s, current_train_num)
  {
    var sched_search_date = $scope.search_date.obj;
    /*
    var sched_search_date = new Date();
    
    sched_search_date.setUTCFullYear(s['searchDate'].substring(0, 4));
    sched_search_date.setUTCMonth(s['searchDate'].substring(5, 7) - 1);
    sched_search_date.setUTCDate(s['searchDate'].substring(8, 10));
    console.log(sched_search_date);*/
/*
    //var sched_search_date = new Date(s['searchDate'] + ' 12:00:00');
    console.log($scope.search_date.obj);
    console.log(sched_search_date);
    console.log(time_service.is_same_day(new Date(), sched_search_date)); 
    console.log(new Date());
    console.log(sched_search_date);
    // return if search date is not today
    if (!time_service.is_same_day(new Date(), sched_search_date))
    {
      // make sure date is today
      var alertPopup = $ionicPopup.alert(
      {
        title: 'Live Tracking',
        template: "This feature is only available for today's date."
      });

      alertPopup.then(function(res) 
      {
        console.log('tried to scrape for bad date');
      });
      return;
    }
  */
    $state.go('app.liveData');

    // set date
    $scope.live_data.date = sched_search_date;

    // set schedule
    $scope.live_data.schedule = s;

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

    if (current_train_num == null)
    {
      // set current train number
      $scope.live_data.current_num = $scope.live_data.train_numbers[0];
    }
    else
    {
      $scope.live_data.current_num = current_train_num;
    }

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

    train_obj['duration'] = time_service.min_to_hours(train_obj['duration']);

    // remove seconds from military time
    train_obj['timeStart'] = time_service.mil_remove_seconds(train_obj['timeStart']);
    train_obj['timeEnd'] = time_service.mil_remove_seconds(train_obj['timeEnd']);
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
      showDelay: 0,
      duration: 20000
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
      },
      function(dataResponse)
      {
        // set to empty array
        $scope.schedules = [];
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
      showDelay: 0,
      duration: 20000
    });

    //var mil_arr_time = time_service.mil_remove_seconds($scope.live_data.schedule['timeEnd']);

     data_service.get_live_data($scope.live_data.current_num, 
                                $scope.live_data.schedule['timeEnd']).then(function(dataResponse)
      {
         $scope.live_data.data = dataResponse.data;
         if ($scope.live_data.data == '[]')
         {
            $scope.live_data.data = []
         }

         $ionicLoading.hide();
      },
      function(dataResponse)
      {
        // set to empty array
        $scope.live_data.data = [];
        $ionicLoading.hide();
      });  
  }

  /* Error check data */
  $scope.verify_array = function(array)
  { 
    if (typeof array != "undefined" && array != null && array.length > 0)
    {
      return true;
    }
    return false;
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
  $scope.openModal = function(schedule) 
  {
    $scope.modal_schedule = schedule;
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

  /*************** POPOVER STUFF ****************/
  $ionicPopover.fromTemplateUrl('templates/popover_settings.html', 
  {
    scope: $scope
  }).then(function(popover) 
  {
    $scope.popover = popover;
  });
  
  $scope.openPopover = function($event) 
  {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() 
  {
    $scope.popover.hide();
  };

  /*************** SIDE-MENU STUFF ****************/
  $scope.showMenu = function()
  {
    $ionicSideMenuDelegate.toggleRight();
  }

  /*************** NOTIFICATION STUFF ****************/

  $scope.get_notifications = function()
  {
    //$scope.all_notifications = notification_service.get_notifications();
    //$scope.all_notifications = $cordovaLocalNotification.getAll();
    $cordovaLocalNotification.getAllScheduled().then(function(all_notifs) 
    {
      $scope.all_notifications = [];
      // parse data here
      for (var i = 0; i < all_notifs.length; i++)
      {
        console.log(JSON.stringify(all_notifs[i]));

        var data = JSON.parse(all_notifs[i].data);
        var schedule = data['schedule'];
        var date = new Date(data['date_in_miliseconds']);
        var stop = data['stop']
        var deadline = new Date(data['deadline']);
        var cushion = data['cushion'];
        var deadline_no_cushion = new Date(deadline.getTime() + cushion*60000);
        var deadline_time_nc = time_service.extract_time_from_obj(deadline_no_cushion, false);
        var deadline_time = time_service.extract_time_from_obj(deadline, false);
        var last_updated = data['last_updated'];
        var notif_rep = {
                          id: all_notifs[i].id,
                          schedule: schedule,
                          date: date,
                          stop: stop,
                          deadline: deadline,
                          deadline_time: deadline_time,
                          deadline_time_nc: deadline_time_nc,
                          cushion: cushion,
                          train_num: data['train_num'],
                          last_updated: last_updated
                        };
        $scope.all_notifications.push(notif_rep);
      }

      $scope.all_notifications.sort(function (a, b) 
      {
        return a.deadline - b.deadline;
      });
    });
  }

  $scope.alert_notifications = function()
  {
    $cordovaLocalNotification.get(1, function(n)
    {
      console.log(n.text);
    });
    console.log("checking if 1 exists")
    $cordovaLocalNotification.isScheduled(1, function (present) 
    {
      alert(present ? "present" : "not found");
    });
    console.log(JSON.stringify($cordovaLocalNotification.isScheduled(1)))
    console.log(JSON.stringify($cordovaLocalNotification.getScheduledIds()))
    notification_service.update_all_notifications();
  }

  $scope.logScheduled = function() 
  {
    $cordovaLocalNotification.getScheduledIds().then(function(num) 
    {
      console.log(JSON.stringify(num));
    });
    console.log(JSON.stringify($scope.all_notifications));
  }

  $scope.show_notif_button = function(string)
  {
    return time_service.is_time_string(string);
  }

  $ionicPlatform.ready(function () 
  {
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.setDefaults(
    {
      title:  "Locomotive",
      ticker: "Locomotive background tracking mode",
      text:   "Tracking set notifications"
    })

    /* START UP UPDATING FUNCTION */
    setInterval(notification_service.update_all_notifications, 120000);


    $rootScope.$on('$cordovaLocalNotification:schedule', function (event, notification, state) 
    {
      var alertPopup = $ionicPopup.show(
      {
        title: 'Notification successfully set.'
      });
      setTimeout(function() 
      {
        alertPopup.close(); //close the popup after 3 seconds for some reason
      }, 1000);
      console.log("scheduled")
      console.log(notification.text);
    });

    $rootScope.$on('$cordovaLocalNotification:trigger', function (event, notification, state) 
    {
      $scope.all_notifications = $scope.get_notifications();
    });

    $rootScope.$on('$cordovaLocalNotification:cancel', function (event, notification, state) 
    {
      $scope.all_notifications = $scope.get_notifications();
    });

    $rootScope.$on('$cordovaLocalNotification:cancelall', function (event, state) 
    {
      $scope.all_notifications = $scope.get_notifications();
    });

    $scope.schedule_notification_now = function()
    {
      notification_service.schedule_notification_now($scope.to.value);
    }
  });

  // schedule a notification
  $scope.add_notif_popup = function(place, time) 
  {
    /* DATA TO SET NOTIFICATION */
    $scope.notif_template = {cushion: 10, place: place, time: time};
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show(
    {
      templateUrl: "templates/notif_popup.html",
      title: "Create Notification",
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Set</b>',
          type: 'button-positive',
          onTap: function(e) 
          {
            notification_service.schedule_notification($scope.live_data, place, time, $scope.notif_template.cushion);
          }
        }
      ]
    });
    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });
    setTimeout(function() { myPopup.close(); }, 15000);
  }

  // remove a notification
  $scope.remove_notif_popup = function(notif) 
  {
     var confirmPopup = $ionicPopup.confirm(
     {
       title: 'Cancel Notification',
       template: 'Are you sure you want to cancel this notification?'
     });

     confirmPopup.then(function(res) 
     {
       if(res) 
       {
          $cordovaLocalNotification.cancel(notif.id);
       } 
       else 
       {
         console.log('Do not delete');
       }
     });
   };

   // clear all notifications currently scheduled
  $scope.clearall_notif_popup = function() 
  {
    $cordovaLocalNotification.getScheduledIds().then(function(all_ids)
    {
      // make sure ids are all length 0
      if (all_ids.length == 0)
      {
        var alertPopup = $ionicPopup.alert(
        {
          title: 'Clear Notifications',
          template: 'No notifications are currently set'
        });

        alertPopup.then(function(res) 
        {
          console.log('tried to clear 0 notifications');
        });
        return;
      }
      var confirmPopup = $ionicPopup.confirm(
      {
        title: 'Clear Notifications',
        template: 'Are you sure you want to clear all notifications?'
      });

      confirmPopup.then(function(res) 
      {
        if(res) 
        {
          $cordovaLocalNotification.cancelAll();
        } 
        else 
        {
          console.log('Do not delete');
        }
      });
   });
  };

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

    .state('app.notifications', {
      url: "/notifications",
      views: {
        'home-view': {
          templateUrl: "templates/notifications.html"
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
