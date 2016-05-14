app.service('map_service', function() 
{
  // function to alter names to locate on gps map
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

  // initialize locations on map
  function initMapLocations(location1, location2) {

    var start = fixNames(location1);
    var end = fixNames(location2);

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;


    var styledType = new google.maps.StyledMapType([{"elementType":"geometry","stylers":[{"hue":"#ff4400"},{"saturation":-68},{"lightness":-4},{"gamma":0.72}]},{"featureType":"road","elementType":"labels.icon"},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"hue":"#0077ff"},{"gamma":3.1}]},{"featureType":"water","stylers":[{"hue":"#00ccff"},{"gamma":0.44},{"saturation":-33}]},{"featureType":"poi.park","stylers":[{"hue":"#44ff00"},{"saturation":-23}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"hue":"#007fff"},{"gamma":0.77},{"saturation":65},{"lightness":99}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"gamma":0.11},{"weight":5.6},{"saturation":99},{"hue":"#0091ff"},{"lightness":-86}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"lightness":-48},{"hue":"#ff5e00"},{"gamma":1.2},{"saturation":-23}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"saturation":-64},{"hue":"#ff9100"},{"lightness":16},{"gamma":0.47},{"weight":2.7}]}], {name: 'LocoMotive Style'});

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      center: {lat: 40.340166, lng: -74.657889}, 
      mayTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'style']
      }
    });
    map.mapTypes.set('style', styledType);
    map.setMapTypeId('style');
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(start, end, directionsService, directionsDisplay);
    var marker = putGPSonMap(map);
  } 

  //reset the GPS if necessary
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

  // add marker to map
  function putGPSonMap(map)
  {
    var image = 
    {
      //url: 'https://cdn0.iconfinder.com/data/icons/world-issues/500/running_man-64.png',
      url: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-man-32.png',
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(64, 64),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(32, 48)
    };

    var marker = new google.maps.Marker({map: map, icon:image, animation: google.maps.Animation.DROP});
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

  // display route between origin and destination
  function calculateAndDisplayRoute(location1, location2, directionsService, directionsDisplay) 
  {
    directionsService.route({
      origin: location1,
      destination: location2,
      travelMode: google.maps.TravelMode.TRANSIT, 
      transitOptions: { modes: [google.maps.TransitMode.TRAIN] }
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  // call helper functions (above) to display autotracking map
  this.show_map = function(from, to)
  {
    console.log("hi")
    map = initMapLocations(from, to);
    //$scope.map = map;
    return map;
  }
});