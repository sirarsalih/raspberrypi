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

app.get('/interstellar', function(request, response){
	var binaryLatitude = floatToBinary(59.902598);
	var binaryLongitude = floatToBinary(10.822016);
	response.send(binaryLatitude+"<br>"+binaryLongitude);
});

function floatToBinary(float) {
    var hex = floatToHexIEEE754_32Bit(float);
    var binary = hexToBinary(hex);
    var float = hexToFloat(hex); //Control, float = float?
    return binary;
}

app.get('/toBinary', function(request, response){
    var value = request.query.val;
    var hex;
    var binary;
    if(value == undefined) {
        response.send("Undefined input.");
    } else if(isInt(value)) {
        hex = intToHex(value);
        binary = hexToBinary(hex);
        response.send(binary);
    } else if(isFloat(value)) {
        hex = floatToHexIEEE754_32Bit(value);
        binary = hexToBinary(hex);
        response.send(binary);
    } else if(isHex(value)){
        binary = hexToBinary(value);
        response.send(binary);
    }
});

function isInt(val) {
    return !isNaN(val) && val.toString().indexOf('.') == -1;
}

function isFloat(val) {
    return !isNaN(val) && val.toString().indexOf('.') != -1;
}

function isHex(val) {
    return val.length && !isNaN(parseInt(val,16));
}

function floatToHexIEEE754_32Bit(no) {
	var text = '' + no, noa = [0], tmp, expBit, i, j, k, l, obj = {};
	text = text.toLowerCase();
	// Basic Data
	obj.TEXT = text;
	obj.sign = ( text.indexOf('-') >= 0 ) ? '-' : '+';
	obj.e = ( text.indexOf('e') >= 0 ) ? 'e' + obj.sign : '';
	obj.TEXT_FLOAT = (obj.e) ? text.split(obj.e)[0] : text;
	obj.TEXT_EXP = (obj.e) ? text.split(obj.e)[1] : '0';
	text = obj.TEXT_FLOAT;
	tmp = text.split('.');
	obj.Num = (+tmp[0]);
	obj.Dec = (+( '0.' + ((tmp[1]) ? tmp[1] : '0' )));
	obj.Exp = (obj.e) ? parseInt( obj.TEXT.split( obj.e )[1], 10) : 127;
	obj.Exp += (obj.e && obj.sign == "+") ? 127 : 0;
	text = (obj.e) ? text.split(obj.e)[0] : text;
	// Bit 1
	noa[0] = ( obj.sign === '-' ) ? 1 : 0;
	// Bit 10 onwards
	tmp = obj.Num;
	no = obj.Dec;
	tmp = tmp.toString(2) + '.';
	for ( i = tmp.length; (i < 32 && no > 0); i++ ) {
		no *= 2;
		text = ('' + no).split('.')[0];
		no -= (+text);
		tmp += text;
	}
	j = 0;
	i = tmp.indexOf('.');
	text = tmp;
	l = i;
	if (obj.Num > 0) {
		for (i--, k = i; i > -1; i--) {
			if (tmp[i] === '1') {
				k = i;
			}
		}
		j = (l - 1) - k;
	}
	else {
		for (i++, k = i; i < tmp.length; i++) {
			if (tmp[i] === '1') {
				k = i - 1;
				j = i - l;
				i = tmp.length;
			}
		}
		j = -j;
	}
	// Bit 2 - 9
	no = (obj.e) ? 0 : j;
	//no = (obj.Num > 0) ? no : ( (no > 0) ? no : 0 );
	obj.Exp += no;
	tmp = obj.Exp.toString(2);
	for ( i = 8, j = (tmp.length - 1); i > 0; i--, j-- ) {
		noa[ i ] = ( tmp[ j ] ) ? tmp[j] : '0';
	}
	// Back to Bit 10 onwards
	tmp = text.replace('.', '');
	for ( i = 9, j = k + 1; i < 32; i++, j++ ) {
		noa[i] = (tmp[j]) ? tmp[j] : '0';
	}
	text = noa.join("");
	no = parseInt( text, 2 );
	tmp = no.toString(16).toUpperCase();
	text = '';
	no = (tmp.length > 8) ? 16 : 8;
	no -= tmp.length;
	for ( i = 0; i < no; i++) {
		text += '0';
	}
	text += tmp;    
	return text;   
}

function intToHex(no) {
    return Number(no).toString(16);
}

function hexToBinary(hex){
    return parseInt("0x" + hex,16).toString(2);
}

function hexToFloat(hex) {
    var str = "0x"+hex;
    var float = 0, sign, order, mantiss,exp,
    int = 0, multi = 1;
    if (/^0x/.exec(str)) {
        int = parseInt(str,16);
    }else{
        for (var i = str.length -1; i >=0; i -= 1) {
            if (str.charCodeAt(i)>255) {
                console.log('Wrong string parametr'); 
                return false;
            }
            int += str.charCodeAt(i) * multi;
            multi *= 256;
        }
    }
    sign = (int>>>31)?-1:1;
    exp = (int >>> 23 & 0xff) - 127;
    mantiss = ((int & 0x7fffff) + 0x800000).toString(2);
    for (i=0; i<mantiss.length; i+=1){
        float += parseInt(mantiss[i])? Math.pow(2,exp):0;
        exp--;
    }
    return float*sign;
}

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, ip);
//app.listen(port, ip);
console.log('Node express server started on port %s', port);
