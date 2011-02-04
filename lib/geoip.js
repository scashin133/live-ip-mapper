var redis = require("redis-client");
var json = require("json");

function Geoip(options) {
  var geoip = this;
  
  geoip.client = redis.createClient();
  
  geoip.total = 0;
  
  geoip.client.stream.on( 'connect', function() {
    geoip.client.dbsize(function(err, info){
      geoip.total = info;
      geoip.emit('ready');
    });
  });
};

exports.createClient = function (options) {
    var geoclient = new Geoip(options);
    geoclient.on('ready', function(){
      return geoclient;
    });
};

exports.Geoip = Geoip;

Geoip.prototype = new process.EventEmitter();

Geoip.prototype.dot2num = function(dot) {
  var d = dot.split('.');
  return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

Geoip.prototype.search = function(dot, min, max, previousmax, previousmin, callback) {
  var geoip = this;
  var ip = geoip.dot2num(dot);
  var target = (Math.floor((max-min)/2) + min);
  geoip.client.get(target, function(err, info){
    var value = JSON.parse(info);
    var ip_start = value.ip_start;
    ip_start = parseInt(ip_start);
    if(ip_start > ip) {
      previousmax = max;
      max = target;
      if(previousmax == max) {
        callback(value);
      } else {
        geoip.search(dot, min, max, previousmax, previousmin, callback);
      }
    } else if(ip_start < ip) {
      previousmin = min;
      min = target;
      if(previousmin == min) {
        callback(value);
      } else {
        geoip.search(dot, min, max, previousmax, previousmin, callback);
      }
    } else if(ip_start == ip) {
      callback(value);
    }
  });
}
