app.service('time_service', function($http) 
{
  this.get_date_string = function (date_obj)
  {
    var m = date_obj.getMonth() + 1;
    var d = date_obj.getDate();
    var y = date_obj.getFullYear();
    if (d < 10)
      $d = '0' + d
    if (m < 10)
      m = '0' + m
    return y + '-' + m + '-' + d
  }

  this.get_month_name = function(date_obj)
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[date_obj.getMonth()];
  }

  this.get_day_string = function(date_obj)
  {
    var day = date_obj.getDate();
    if (day < 10)
      day = '0' + day
    return day
  }

  this.get_month_string = function(date_obj)
  {
    var month = date_obj.getMonth() + 1;
    if (month < 10)
      month = '0' + month
    return month
  }

  this.mil_to_standard = function(value) 
  {
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

});