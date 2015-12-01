// var Firebase = require('firebase');
var Queue = require('firebase-queue');
var rp = require('request-promise');
var constants = require('../common/constants');
module.exports = (function() {
    var root = constants.fbRoot;
    console.log(constants);
    var services = {
        start: start
    };

    return services;

    function start() {
        console.log('started');

        var options = {
            'numWorkers': 10 // una tarea completada por worker simultaneamente con 100 trabajo mas lento que con 10 no se por que

        };



        // var rootRef = new Firebase('https://scmtest.firebaseio.com');
        var queueRef = root.child('uploads').child('queue');
        var queue = new Queue(queueRef, options, function(data, progress, resolve, reject) {
            // Read and process task data
            console.log('fotos', data);

            // Do some work
            // progress(50);

            var uri = 'http://localhost:52154/api/test/files';
            var method = 'POST';
            var json = {
                "idFoto": data.idFoto,
                "idInspeccion": data.idInspeccion,
                "name": getRandomArbitrary(1, 50000) + '.jpeg',
                "base64Data": data.base64Data
            };

            // ESTE METODO TAMBIEN FUNCIONA Y LUCE MAS ORGANIZADO
            var options = {
                method: method,
                uri: uri,
                body: json,
                json: true // Automatically stringifies the body to JSON 
            };

            rp(options)
                .then(function(parsedBody) {
                    console.log('ok fotos');
                    resolve();
                })
                .catch(function(err) {
                    console.error(err);
                    reject(err);
                });

        });

    }

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }


})();
