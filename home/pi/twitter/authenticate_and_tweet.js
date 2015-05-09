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

var Codebird = require("/home/pi/node-v0.10.2-linux-arm-pi/lib/node_modules/codebird");

var cb = new Codebird();
cb.setConsumerKey("CONSUMER_KEY", "CONSUMER_SECRET");
cb.setToken("TOKEN_KEY", "TOKEN_SECRET");

cb.__call(
    "statuses_update",
    {"status": "Wohoo, I'm tweeting!"},
    function (reply) {
        console.log(reply);
    }
);
