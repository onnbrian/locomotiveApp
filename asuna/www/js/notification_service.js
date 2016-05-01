app.service('notification_service', function($cordovaLocalNotification, $ionicPlatform) 
{  
  function to_military_hours(hour)
  {
    if (hour < 12)
      return hour + 12
    return hour
  }

  function get_date_time(time)
  {
    var hour = time.substring(0, 2)
    if (hour.slice(-1) == ':')
    {
      hour = time.substring(0, 1)
    }
    var hour = to_military_hours(Number(hour))
    var minutes = Number(time.slice(-2))
    var duration = 5;
    notif_time = new Date()
    notif_time.setHours(hour)
    notif_time.setMinutes(minutes - duration)
    //notif_time.setMinutes(notif_time.getMinutes() - duration)
    return notif_time
  }

  this.schedule_notification = function (place, time) 
  {
    var test = get_date_time(time)
    alert("Set alarm for " + test.toString());
    if (ionic.Platform.isWebView()) 
    {
      $cordovaLocalNotification.schedule(
      {
        id: 1,
        title: place,
        text: 'Arriving in 5 minutes',
        at: test,
        data: {
          customProperty: 'custom value'
              }
      })
      .then(function (result) 
      {
        console.log('Notification 1 triggered');
      });
    }
  }

  this.schedule_notification_now = function (place) 
  {
    alert("clicked")
    if (ionic.Platform.isWebView()) 
    {
      $cordovaLocalNotification.schedule(
      {
        id: 1,
        title: place,
        text: 'Arriving in 5 minutes',
        data: {
          customProperty: 'custom value'
              }
      })
      .then(function (result) 
      {
        console.log('Notification 1 triggered');
      });
    }
  }
});