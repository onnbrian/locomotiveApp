app.service('map_service', function() 
{
  function fixNames(location)
  {
      var start = "Princeton Station, NJ";
      if (location == "Princeton Junction")
          start = "LV Princeton Junction";
      else if (location == "New York Penn Station")
          start = "Pennsylvania Station";
      else if (location == "Philadelphia 30th Street")
          start = "30th Street Station";
      else if (location == "Trenton Transit Center")
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
    var marker = putGPSonMap(map);
    /*
    map.addListener('click', function(event) {
    resetGPS(map, marker);
    });
    */

  } 

  function resetGPS(map, marker){
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        marker.setPosition(pos);
        map.setCenter(pos);
      }, function() {
        handleLocationError(true, marker, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, marker, map.getCenter());
    }
  }

  function putGPSonMap(map)
  {
    var image = 
    {
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
    if (navigator.geolocation) 
    {
      navigator.geolocation.watchPosition(function(position) 
      {
        var pos = 
        {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        marker.setPosition(pos);
        //infoWindow.setContent('Location found.');
       // map.setCenter(pos);
      }, function() 
      {
        handleLocationError(true, marker, map.getCenter());
      });
    } 
    else 
    {
      // Browser doesn't support Geolocation
      handleLocationError(false, marker, map.getCenter());
    }
    return marker;
  }

  function calculateAndDisplayRoute(location1, location2, directionsService, directionsDisplay) 
  {
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

  this.show_map = function(from, to)
  {
    console.log("hi")
    map = initMapLocations(from, to);
    //$scope.map = map;
    return map;
  }
});