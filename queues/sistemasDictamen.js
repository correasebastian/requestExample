var Firebase = require('firebase');
var Queue = require('firebase-queue');
var rp = require('request-promise');

module.exports = (function() {

    var services = {
        start: start
    };

    return services;

    function start() {
        console.log('started');

        var options = {
            'numWorkers': 10 // una tarea completada por worker simultaneamente con 100 trabajo mas lento que con 10 no se por que

        };

        var rootRef = new Firebase('https://scmtest.firebaseio.com');
        var queueRef = rootRef.child('dictamenes').child('sistemas').child('queue');
        var queue = new Queue(queueRef, options, function(data, progress, resolve, reject) {
            // Read and process task data
            console.log('sistemasdictamen', data);

            // Do some work
            progress(50);

            var uri = 'http://localhost:52154/api/inspeccionesSistemas';
            var method = 'POST';
            var json = {
                "idInspeccion": "-K43e1uhgNoW-XlAqcIw",
                "idSistemasDictamen": 777,
                "fecha": "2015-11-30T20:43:19.0647999-05:00"
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
                    console.log('ok sistemas dictamen');
                    resolve();
                })
                .catch(function(err) {
                    console.error(err);
                    reject(err);
                });

        });

    }


})();
