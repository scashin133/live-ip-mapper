var meryl = require('meryl'),
  Connect = require('connect'),
  qs = require('querystring');
var http = require('http');
var json = require('json');
var io = require('socket.io');
var geoip = require('./lib/geoip');

var g = new Geoip({});

meryl.p(Connect.staticProvider({root: 'public'}));

meryl.p('GET /', Connect.basicAuth(function(user, pass){
  return 'socialcast' == user && 'P@ssw0rdL33t' == pass;
}));

meryl.h('GET /', function (req, resp) {
  resp.render('index');
});

meryl.h('POST /ip', function (req, resp) {
  var postdataAsObject = qs.parse(req.postdata.toString());
  if (postdataAsObject && postdataAsObject.ip) {
    g.on('ready', function(){
      g.search(postdataAsObject.ip, 0, g.total, 0, 0, function(geo){
        socket.broadcast(geo);
      });
    });
  }
  resp.status = 204;
  resp.send();
});

var server = http.createServer(meryl.cgi({templateDir: 'views'}));
server.listen(3000);
var socket = io.listen(server);
socket.on('connection', function(client){});

console.log('listening...');