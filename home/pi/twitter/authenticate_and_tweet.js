/**
 * Created by Sirar on 09.05.2015.
 *
 * This script authenticates to Twitter using the
 * access credentials of a Twitter app
 * and tweets on behalf of the app user (owner).
 * An app can be created here:
 * https://apps.twitter.com/
 *
 **/

var request = require("/home/pi/node-v0.10.2-linux-arm-pi/lib/node_modules/request");
var Codebird = require("/home/pi/node-v0.10.2-linux-arm-pi/lib/node_modules/codebird");

var cb = new Codebird();
cb.setConsumerKey("CONSUMER_KEY", "CONSUMER_SECRET");
cb.setToken("TOKEN_KEY", "TOKEN_SECRET");

var latestNNUGEvent = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False" +
    "&group_urlname=NNUGOslo&photo-host=public&page=500&fields=&order=time&desc=false&status=upcoming" +
    "&sig_id=35617582&sig=738e4633d1d3a25398a13e7e91b3379334ddf308";

request(latestNNUGEvent, function(error, response, body){
    if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        var dateCreated = new Date(parseInt(json.results[0].created));
        var date = new Date(parseInt(json.results[0].time));
        var name = json.results[0].name;

        if(getDaysInBetween(new Date(), dateCreated) == -1) {
            tweet(name);
            return;
        }

        switch(getDaysInBetween(new Date(), date)){
            case 7:
                tweet(name);
                break;
            case 1:
                tweet(name);
                break;
            default:
                break;
        }
    }
});

function getDaysInBetween(date1, date2) {
    var one_day_ms = 1000*60*60*24;
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    var difference_ms = date2_ms - date1_ms;
    return Math.round(difference_ms/one_day_ms);
}

function tweet(message) {
    var params = {
        status: message
    };
    cb.__call(
        "statuses_update",
        params,
        function (reply) {
            console.log(reply);
        }
    );
}
