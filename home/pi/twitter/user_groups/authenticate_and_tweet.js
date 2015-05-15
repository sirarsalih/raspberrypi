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

//The upcoming meetup events URLs (signed) for each user group, the "page" parameter determines the max
var nnugOslo = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=NNUGOslo&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=eadcf896e2b735a18e8bb31157f7502ae8dc038c";
var nnugBergen = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=NNUG-Bergen&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=3c986d5987da6b7cdf69e37ea808a56cec73118c";
var nnugStavanger = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=NNUG-Stavanger&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=adb46c729fe91e53b46c857986591001d0694b30";
var nnugTrondheim = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=NNUG-Trondheim&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=eadb56f84dca1f1bd1e4f52354555ea1c8e9e7b6";
var nnugKristiansand = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=NNUG-Kristiansand&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=c5fef57825c7a154d81308822a6e999107204ec6";
var nnugVestfold = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=NNUG-Vestfold&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=11f4f19030543510b03c5cdfb6e7a11eeddab5f1";
var nnugHaugesund = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=NNUG-Haugesund&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=9c573e9f576217c29c2258525548e9f5371fd282";
var angularJsOslo = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=AngularJS-Oslo&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=600abdd8ed991dce67bb02437b7169bbcb8fb650";
var geekBeerOslo = "https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_urlname=GeekBeer&photo-host=public&page=20&fields=&order=time&desc=false&status=upcoming&sig_id=35617582&sig=54d7f0f3820ecff16be447a3e3e3f55d5e722114";

requestDataAndTweetFor(nnugOslo);
requestDataAndTweetFor(nnugBergen);
requestDataAndTweetFor(nnugStavanger);
requestDataAndTweetFor(nnugTrondheim);
requestDataAndTweetFor(nnugKristiansand);
requestDataAndTweetFor(nnugVestfold);
requestDataAndTweetFor(nnugHaugesund);
requestDataAndTweetFor(angularJsOslo);
requestDataAndTweetFor(geekBeerOslo);

function requestDataAndTweetFor(userGroup) {
    request(userGroup, function(error, response, body){
        var json = JSON.parse(body);
        if (!error && response.statusCode == 200) {
            for(var i = 0; i < json.results.length; i++) {
                var dateCreated = new Date(parseInt(json.results[i].created));
                var date = new Date(parseInt(json.results[i].time));
                var name = json.results[i].name;
                var eventUrl = json.results[i].event_url;
                var groupUrlName = json.results[i].group.urlname;
                var message = buildMessage(name, date, eventUrl, groupUrlName);

                if(getDaysInBetween(new Date(), dateCreated) == -1) {
                    tweet(message);
                    continue;
                }

                switch(getDaysInBetween(new Date(), date)){
                    case 7:
                        tweet(message);
                        break;
                    case 1:
                        tweet(message);
                        break;
                    default:
                        break;
                }
            }
        }
    });
}

function buildMessage(name, date, eventUrl, groupUrlName) {
    var hashTags = "#"+groupUrlName.replace("-", "");
    var message = name + " " + date.getDate() + "/" + (date.getMonth()+1) + ", RSVP today! " + hashTags + " " + eventUrl;
    if(message.length > 140) {
        return message.replace(name + " ", "");
    }
    return message;
}

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
