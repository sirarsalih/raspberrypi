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
cb.setConsumerKey("OJd8sRgYd8XLNa6DeODOfqZcM", "G77z1xs7hGH9hd6sqJTJtplQW8xk4fQrrMOVRhFQzyhKeGJZj2");
cb.setToken("484733763-KnkwXAW4E84XFRn0w4NEoUsKO3iXSFjfQ5Y4QfjY", "J35qoide0fnz7mRd9XamUHIRKzMMV2ccIJ5bYdj4ajEoZ");

cb.__call(
    "statuses_update",
    {"status": "Sirar's #RasPi bot: Everything is a-ok."},
    function (reply) {
        console.log(reply);
    }
);
