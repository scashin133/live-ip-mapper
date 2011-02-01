(function($) {
  $.fn.amap = function(options) {
    return this.each(function() {
      $(this).data('amap', new $.amap(this, options));
    });
  }

  $.amap = function(element, options) {
    var defaults = {
      mapTypeId: google.maps.MapTypeId.ROADMAP, 
      zoom: 1
    };
    
    var options = $.extend({}, defaults, options);
    var element = $(element)[0];
    var map = new google.maps.Map(element, options);
    var opendInfoWindow;
    
    google.maps.event.addListener(map, 'click', function(){
      if(opendInfoWindow !== undefined){
        opendInfoWindow.close();
        delete opendInfoWindow;
      }
    })
    
    var markerCache = [];
    
    if ((options.latitude !== null || options.latitude !== undefined) && (options.longitude !== null || options.longitude !== undefined)) {
      map.setCenter((new google.maps.LatLng(options.latitude, options.longitude)));
    }
    function addMarker(markerOptions){
      var marker;
      
      if(markerCache.length > 50) {
        var staleMarker = markerCache.pop();
        console.log(staleMarker);
        google.maps.event.clearListeners(staleMarker, 'click');
        staleMarker.setMap(null);        
        delete staleMarker;
      }
      marker = new google.maps.Marker(markerOptions);
      markerCache.push(marker);
      marker.setAnimation(google.maps.Animation.DROP);
      if(markerOptions.html !== undefined){
        var infowindow = new google.maps.InfoWindow();
        infowindow.content = markerOptions.html;
        google.maps.event.addListener(marker, 'click', function() {
          if(opendInfoWindow !== undefined){
            opendInfoWindow.close();
          }
          infowindow.open(map, marker);
          opendInfoWindow = infowindow;
        });
      }
      marker.setMap(map);
    }
    this.addMarker = function(data){
      for(i=0;i<data.length;i++) {
        var markerOptions = {};
        markerOptions.markerId = data[i].markerId;
        markerOptions.title = data[i].title;
        if(data[i].html !== undefined){
          markerOptions.html = data[i].html;
          markerOptions.clickable = true;
        } else {
          markerOptions.clickable = false;
        }

        if(data[i].latitude !== undefined && data[i].longitude !== undefined) {
          markerOptions.position = new google.maps.LatLng(data[i].latitude, data[i].longitude);
          addMarker(markerOptions);
        } else if(data[i].address !== undefined) {
          
          var geocorder = new google.maps.Geocoder();
          geocorder.geocode( { 'address': data[i].address}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
              markerOptions.position = results[0].geometry.location;
              addMarker(markerOptions);
            }
          });
        }
      }
    }
  }
})(jQuery);