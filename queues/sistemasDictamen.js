// var Firebase = require('firebase');
var Queue = require('firebase-queue');
var rp = require('request-promise');
var constants = require('../common/constants');
var Promise = require('bluebird');
var exception = require('../common/exception');
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
        var queueRef = root.child('dictamenes').child('sistemas').child('queue');
        var queue = new Queue(queueRef, options, function(data, progress, resolve, reject) {
            // Read and process task data
            console.log('sistemasdictamen', data);

            // Do some work
            progress(50);

            getToSQL(data.idDictamen)
                .then(onGetSisDic)
                .then(postData)
                .catch(exception.catcherQueue('cant insert sisDictamen', reject));

            function onGetSisDic(sisDicSql) {
                var uri = 'http://localhost:52154/api/inspeccionesSistemas';
                var method = 'POST';
                var json = {
                    "idInspeccion": data.idInspeccion,
                    "idSistemasDictamen": sisDicSql
                };

                // ESTE METODO TAMBIEN FUNCIONA Y LUCE MAS ORGANIZADO
                var options = {
                    method: method,
                    uri: uri,
                    body: json,
                    json: true // Automatically stringifies the body to JSON 
                };

                return options;

            }

            function postData(options) {

                return rp(options)
                    .then(function(parsedBody) {
                        console.log('ok sistemas dictamen');
                        resolve();
                    });

            }



        });

    }

    function getToSQL(fbSisDic) {
        return new Promise(function(resolve, reject) {

            var sisDic = root.child('config/dictamenes/sura/sistemasIdentificacion').child(fbSisDic);

            sisDic.once('value', function(snap) {

                var sisDicObj = snap.val();
                console.log('getToSQL', sisDicObj);
                if (sisDicObj) {
                    var sisDicSQL = sisDicObj.idsistemasdictamen;
                    resolve(sisDicSQL);

                }
                else{
                  reject('cant find sisDicObj');  
                }

                

            });

        });
    }


})();
