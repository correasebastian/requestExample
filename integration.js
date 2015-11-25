var request = require('request');
var Firebase = require('firebase');
var Queue = require('firebase-queue');
var Promise = require('bluebird');
var path = require("path");
var moment = require('moment');
var exception = require('./common/exception');
var rp = require('request-promise');
Promise.promisifyAll(request);

var rootRef = new Firebase('https://scmtest.firebaseio.com');
var queueUploadRef = rootRef.child('uploads').child('queue');
var queuePushNotificationRef = rootRef.child('pushNotifications').child('queue');
var pushSecret = 'NjY0MWZhYWM1M2ZkMGI5MDY0NWJiNzI3MjI3NDllNTYzMTk2ZjYyNmQ0NDA5Zjlm'; //base64secret
var applicationId = 'ca8ecabf';
var pushHeader = {
    'X-Ionic-Application-Id': applicationId,
    'Authorization': 'Basic ' + pushSecret,
    'Content-Type': 'application/json'

};

var options = {
    // 'specId': 'inicial',
    'numWorkers': 10 // una tarea completada por worker simultaneamente con 100 trabajo mas lento que con 10 no se por que
        // 'sanitize': false,
        // 'suppressStack': true
};
var queue = new Queue(queueUploadRef, options, function(data, progress, resolve, reject) {
    // Read and process task data
    console.log('inicial specs', data);

    // Do some work
    progress(50);


    function onCompleted(res) {
        console.log('oncompleted respuesta del servidor', res, 'data con que se inicio', data);
        resolve();
    }

    //using request
    // getMock(2000, false)

    var uri = 'http://localhost:52154/api/test/files';
    var method = 'POST';
    var json = {
        "idFoto": data.idFoto,
        "idInspeccion": data.idInspeccion,
        "name": getRandomArbitrary(1, 50000) + '.jpeg',
        "base64Data": data.base64Data
    };
    // uploadBase6Data(data.path)
    requestPromise(uri, method, json)
        .then(onCompleted)
        .catch(exception.catcherQueue('cant upload', reject));

});






// -------PUSHNOTIFICATION
var queuePush = new Queue(queuePushNotificationRef, options, function(data, progress, resolve, reject) {
    // Read and process task data
    console.log('inicial specs', data);

    // Do some work
    progress(50);


    function onCompleted(res) {
        console.log('oncompleted respuesta del servidor para push ', res, 'data con que se inicio', data);
        resolve();
    }

    var uri = 'https://push.ionic.io/api/v1/push';
    var method = 'POST';
    var tokensArray = [];
    //using request
    // getMock(2000, false)
    if (data.toGroup) {
        var groupData = rootRef.child('groups').child(data.to).child('pushTokens');

        groupData.once('value', function(snap) {
            console.log(snap.val());
            if (snap.val()) {
                var tokens = snap.val();

                tokens.forEach(function(token) {
                    tokensArray.push(token.token);
                });

                send();
            } else {
                reject('cant get the detination user data');

            }
        });
    } else {
        var userMainData = rootRef.child('users').child(data.to).child('mainData');

        userMainData.once('value', function(snap) {
            var mainData = snap.val();
            console.log(mainData);
            if (mainData) {
                tokensArray.push(mainData.pushToken);
                send();
            } else {
                reject('cant get the detination user data');

            }
        });

    }


    function send() {
        var json = {
            "tokens": tokensArray,
            "notification": {
                "alert": data.placa,
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
        // uploadBase6Data(data.path)
        requestPromise(uri, method, json, pushHeader)
            .then(onCompleted)
            .catch(exception.catcherQueue('cant send push notification', reject));

        /* // ESTE METODO TAMBIEN FUNCIONA Y LUCE MAS ORGANIZADO
            var options = {
                method: method,
                uri: uri,
                body: json,
                headers: pushHeader,
                json: true // Automatically stringifies the body to JSON 
            };

            rp(options)
                .then(function(parsedBody) {
                    console.log('send');
                    resolve();
                })
                .catch(function(err) {
                    console.error(err);
                    reject(err);
                });*/


    }


});





// INSPECCION ------------------------------------------------------
var queueInspeccionRef = rootRef.child('inspecciones').child('queue');
var optionsInspeccion = {
    // 'specId': 'inicial',
    'numWorkers': 10 // una tarea completada por worker simultaneamente con 100 trabajo mas lento que con 10 no se por que
        // 'sanitize': false,
        // 'suppressStack': true
};
var queueInspeccion = new Queue(queueInspeccionRef, optionsInspeccion, function(data, progress, resolve, reject) {
    // Read and process task data
    console.log('inspecciones tasks', data);

    // Do some work
    progress(50);


    function onCompleted(res) {
        console.log('oncompleted respuesta del servidor', res, 'data con que se inicio', data);
        resolve();
    }

    var uri = "http://localhost:52154/api/inspecciones";
    var method = "POST";
    var json = {
        idInspeccion: data.idInspeccion,
        placa: data.placa

    };
    requestPromise(uri, method, json)
        .then(onCompleted)
        .catch(exception.catcherQueue('cant insert inspeccion', reject));

});

function getMock(delay, withError) {
    var url = 'http://requestb.in/xcctc6xc';


    return new Promise(function(resolve, reject) {

        request(url, function(error, response, body) {

            setTimeout(function() {

                if (error || withError) {
                    reject(error || 'ha ocurrido un error test');
                } else {
                    resolve(body);
                }

            }, delay);


        });


    });

}

function requestPromise(uri, method, json, headers) {
    var options = {
        uri: uri,
        method: method,
        json: json
    };
    if (headers !== undefined) {
        options.headers = headers;
    }
    return new Promise(function(resolve, reject) {


        request(options, function(error, response, body) {
            /*    console.log(response.statusCode);
            if (method === 'POST' && response.statusCode !== 201) {
                if (!error) {
                    error = 'Error: respuesta diferente a creado';
                }

            }
*/
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }


        });


    });
}

function uploadBase6Data(base64Data) {
    var options = {
        uri: 'http://localhost:52154/api/test/files',
        method: 'POST',
        json: {
            // "name": moment().unix() + '.jpeg',
            "name": getRandomArbitrary(1, 50000) + '.jpeg',
            "base64Data": base64Data //"data:image/jpeg;base64,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"
        }
    };
    return new Promise(function(resolve, reject) {

        request(options, function(error, response, body) {

            if (error) {
                reject(error);
            } else {
                resolve(body);
            }


        });


    });

    /*
        var options = {
            json: {
                // "name": moment().unix() + '.jpeg',
                "name": getRandomArbitrary(1, 50000) + '.jpeg',
                "base64Data":base64Data// "data:image/jpeg;base64,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"
            }
        };


    // evaluar si este async es mejor que el request con la promesa manual por la informaciion que me trae (response, body), funciona mejor la promesa manual
        return request.postAsync('http://localhost:52154/api/test/files', options);*/

}

/*//check using unirest too
unirest.post('http://mockbin.com/request')
.header('Accept', 'application/json')
.send({ "parameter": 23, "foo": "bar" })
.end(function (response) {
  console.log(response.body);
});*/

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
