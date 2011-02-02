var meryl = require('meryl'),
  Connect = require('connect'),
  qs = require('querystring');
var http = require('http');
var json = require('json');
var io = require('socket.io');

var freegeoip = http.createClient(8888, '127.0.0.1');

  meryl.p(Connect.staticProvider({root: 'public'}));

  meryl.h('GET /', function (req, resp) {
    resp.render('index');
  });

  meryl.h('POST /ip', function (req, resp) {
    var postdataAsObject = qs.parse(req.postdata.toString());
    if (postdataAsObject && postdataAsObject.ip) {
      
      var request = freegeoip.request('GET', '/json/' + postdataAsObject.ip, {'host': 'localhost'});
      var geoip = '';
      request.end();
      request.on('response', function (response) {
        response.on('data', function (chunk) {
          geoip += chunk;
        });
        response.on('end', function(){
          jsonBody = JSON.parse(geoip);
          socket.broadcast(jsonBody);
        });
      });
    }
    resp.redirect('/');
  });

  var server = http.createServer(meryl.cgi({templateDir: 'views'}));
  server.listen(3000);
  var socket = io.listen(server);
  socket.on('connection', function(client){});

  console.log('listening...');