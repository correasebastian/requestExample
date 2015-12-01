var Firebase = require('firebase');
var fbRoot = new Firebase('https://scmtest.firebaseio.com');
var pushSecret = 'NjY0MWZhYWM1M2ZkMGI5MDY0NWJiNzI3MjI3NDllNTYzMTk2ZjYyNmQ0NDA5Zjlm'; //base64secret
var applicationId = 'ca8ecabf';
var pushHeaders = {
    'X-Ionic-Application-Id': applicationId,
    'Authorization': 'Basic ' + pushSecret,
    'Content-Type': 'application/json'

};
// const FOO = 5;//es6

module.exports = {
    fbRoot: fbRoot,
    pushHeaders: pushHeaders
};
