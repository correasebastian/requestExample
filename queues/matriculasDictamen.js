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
        var queueRef = root.child('dictamenes').child('matriculas').child('queue');
        var queue = new Queue(queueRef, options, function(data, progress, resolve, reject) {
            // Read and process task data
            console.log('matriculas dictamen', data);

            // Do some work
            progress(50);


            getToSQL(data.idDictamen)
                .then(onGetMatDic)
                .then(postData)
                .catch(exception.catcherQueue('cant insert matDictamen', reject));

            function onGetMatDic(matDicSql) {
                var uri = 'http://localhost:52154/api/inspeccionesMatriculas';
                var method = 'POST';
                var json = {
                    "idInspeccion": data.idInspeccion,
                    "idMatriculaDictamen": matDicSql
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
                        console.log('ok matricula dictamen');
                        resolve();
                    });

            }



        });

    }

    function getToSQL(fbMatDic) {
        return new Promise(function(resolve, reject) {

            var matDic = root.child('config/dictamenes/sura/matriculas').child(fbMatDic);

            matDic.once('value', function(snap) {

                var matDicObj = snap.val();
                console.log('getToSQL', matDicObj);
                if (matDicObj) {
                    var matDicSQL = matDicObj.idmatriculadictamen;
                    resolve(matDicSQL);

                } else {
                    reject('cant find matDicObj');
                }



            });

        });
    }


})();
