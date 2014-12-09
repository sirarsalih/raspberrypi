               var backupMsg = "<h3 style=\"color:green;\">Last server backup successfully completed on "+new Date().toLocaleString()+"</h3>";
var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync('/home/pi/ssl_certificate/myserver.key', 'utf8');
var certificate = fs.readFileSync('/home/pi/ssl_certificate/raspi_sirars_com.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var express = require('/home/pi/node-v0.10.2-linux-arm-pi/lib/node_modules/express');
var app = express();
var ip = "192.168.1.110"; //RasPi IP
var port = 443;           //HTTPS
//var port = 80;          //HTTP
var responseText = "";
var arDroneAutonomy = require('/home/pi/node-v0.10.2-linux-arm-pi/lib/node_modules/ardrone-autonomy');
var arDrone = require('/home/pi/node-v0.10.2-linux-arm-pi/lib/node_modules/ar-drone');
var welcomeMsg = "<h1>Sirar's RaspberryPi Node Server</h1>";
var sslLogo = '<a href=\"https://www.positivessl.com\" style=\"font-family: arial; font-size: 10px; color: #212121; text-decoration: none;\"><img src=\"https://www.positivessl.com/images-new/PositiveSSL_tl_trans2.png\" alt=\"SSL Certificate\" title=\"SSL Certificate\" border=\"0\" /></a><br>';

app.get('/', function(request, response){
    response.send(welcomeMsg+sslLogo);
});

app.get('/fly', function(request, response){

  var client = arDrone.createClient();

  client.takeoff();

  client
    .after(5000, function() {
      this.clockwise(0.5);
    })
    .after(3000, function() {
      this.stop();
      this.land();
    });
    var coordinates = request.query.c;
    var mission  = arDroneAutonomy.createMission();
    responseText = "Preparing drone flying mission...<br>";
    console.log('Preparing drone flying mission...');
    //mission.takeoff()
    //.go({x:0, y:0, z:1.5})
    //.land();
    responseText += "Drone taking off...<br>";
    console.log("Drone taking off...");
    mission.run(function (err, result) {
        if (err) {
            responseText += "Flying mission failed!";
            console.log("Flying mission failed!");
            mission.client().stop();
            mission.client().land();
            response.send(responseText);
        } else {
          if(coordinates != undefined) {
	      for(var i = 0; i < coordinates.length; i++) {
                responseText += "Drone flew to position "+coordinates[i]+".<br>";
                console.log("Drone flew to position "+coordinates[i]+".");
            }
          }
            responseText += "Drone landed.";
            console.log("Drone landed.");
            response.send(responseText);
        }
    });
});
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, ip);
//app.listen(port, ip);
console.log('Node express server started on port %s', port);
