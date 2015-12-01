// var Firebase = require('firebase');
var Queue = require('firebase-queue');
var rp = require('request-promise');
var constants = require('../common/constants');
var exception = require('../common/exception');
var Promise = require('bluebird');
module.exports = (function() {
    var root = constants.fbRoot;
    var pushHeaders = constants.pushHeaders;
    var services = {
        start: start
    };

    return services;

    function start() {
        console.log('started push');

        var options = {
            'numWorkers': 10 // una tarea completada por worker simultaneamente con 100 trabajo mas lento que con 10 no se por que

        };



        // var rootRef = new Firebase('https://scmtest.firebaseio.com');
        var queueRef = root.child('pushNotifications').child('queue');
        var queue = new Queue(queueRef, options, function(data, progress, resolve, reject) {
            // Read and process task data
            console.log('push', data);

            // Do some work
            // progress(50);


            getTokens(data)
                .then(onGetTokens)
                .catch(exception.catcherQueue('cant find tokens to send message', reject));

            function onGetTokens(tokensArray) {

                var uri = "https://push.ionic.io/api/v1/push";
                var method = "POST";
                // ESTE METODO TAMBIEN FUNCIONA Y LUCE MAS ORGANIZADO
                var options = {
                    method: method,
                    uri: uri,
                    body: getJson(data.placa, tokensArray),
                    headers: pushHeaders,
                    json: true // Automatically stringifies the body to JSON 
                };

                rp(options)
                    .then(function(parsedBody) {
                        console.log('ok push');
                        resolve();
                    })
                    .catch(function(err) {
                        console.error(err);
                        reject(err);
                    });

            }





        });



    }


    function getTokens(data) {


        return new Promise(function(resolve, reject) {
            var tokensArray = [];
            if (data.toGroup) {
                var groupData = root.child('groups').child(data.to).child('pushTokens');

                groupData.once('value', function(snap) {
                    console.log(snap.val());
                    if (snap.val()) {
                        var tokens = snap.val();

                        tokens.forEach(function(token) {
                            tokensArray.push(token.token);
                        });
                        resolve(tokensArray);


                    }
                    else{
                        reject('cant find tokens in group');
                    }

                    

                });
            } else {
                var userMainData = root.child('users').child(data.to).child('mainData');

                userMainData.once('value', function(snap) {
                    var mainData = snap.val();
                    console.log(mainData);
                    if (mainData) {
                        tokensArray.push(mainData.pushToken);
                        resolve(tokensArray);
                    }
                    else{
                        reject('cant find tokens in user');
                    }
                    
                });

            }



        });



    }

    function getJson(msg, tokensArray) {
        var json = {
            "tokens": tokensArray,
            "notification": {
                "alert": msg || 'nueva notificacion',
                "ios": {
                    "badge": 1,
                    "sound": "ping.aiff",
                    "expiry": 1423238641,
                    "priority": 10,
                    "contentAvailable": 1,
                    "payload": {
                        "key1": "value",
                        "key2": "value"
                    }
                },
                "android": {
                    "collapseKey": "foo",
                    "delayWhileIdle": true,
                    "timeToLive": 300,
                    "payload": {
                        "key1": "tab.notificaciones"
                    }
                }
            }
        };

        return json;
    }


})();
