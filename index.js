var request = require('request');
// var unirest = require('unirest');
var Firebase = require('firebase');
var beautify = require('js-beautify').js_beautify;
var prettyjson = require('prettyjson');
var Queue = require('firebase-queue');
var Promise = require('bluebird');
var rp = require('request-promise');
var requestBlue = Promise.promisifyAll(require('request'));
var path = require("path");
var moment = require('moment');

var RSVP = require('rsvp'); //lightweigth promises used in firebase queue
var lwip = require('lwip');
var fs = require("fs");
Promise.promisifyAll(fs);
Promise.promisifyAll(lwip);


// var url ='http://requestb.in/1jqefqj1';
// request(url, function (error, response, body) {
//   if (!error) {
//     console.log(body);
//   }
// });

// unirest.post(url)
// .header('Accept', 'application/json')
// .send({ "parameter": 23, "foo": "bar" })
// .end(function (response) {
//   console.log(response.body);
// });


var rootRef = new Firebase('https://scmlivelinks.firebaseio.com');
var linksRef = rootRef.child('links');


var options = {
    noColor: false
};

// Regular expression for image type:
// This regular image extracts the "jpeg" from "image/jpeg"
var imageTypeRegularExpression = /\/(.*?)$/;

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

function onPromiseError(msg) {
    function innerError(error) {
        console.log(msg, error);

    }
    return innerError;
}

var base64Data = "data:image/jpeg;base64,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"

var imgFolder = path.join(__dirname, "img");
var imageBuffer;
setTimeout(function() {
    // console.log('fs.writeFileAsync', fs.writeFileAsync);
    var i = 1;
    imageBuffer = decodeBase64Image(base64Data);
    var imageTypeDetected = imageBuffer
        .type
        .match(imageTypeRegularExpression);

    var filename = moment().unix() + '.' + imageTypeDetected[1];

    var userUploadedImagePath = path.join(imgFolder, filename);

    lwip.openAsync(imageBuffer.data, 'jpeg')
        .then(onOpenBuffer)
        .then(write2Disk)
        .catch(onPromiseError('cant access to buffer to transform'));

    function onOpenBuffer(image) {
        return image.batch()
            .rotate(270); // rotate 45degs clockwise (white fill)
        // .scale(0.75) // scale to 75%
        // .crop(200, 200) // crop a 200X200 square from center
        // .blur(5) // Gaussian blur with SD=5

    }

    function write2Disk(image) {


        return new Promise(function(resolve, reject) {
            image.writeFile(userUploadedImagePath, function(err, data) {
                if (err) {
                    console.log('error writing2disk', err);
                    reject(err);
                } else {
                    console.log(' Saved to disk image attached by user:', userUploadedImagePath, data);
                    resolve(data);
                }

            });

        });

    }



}, 1000);


function saveImageBuffer2Disk(filename, buffer) {
    fs.writeFileAsync(filename, buffer)
        .then(onWriteCompleted)
        .catch(onPromiseError('cant write to disk'));

    function onWriteCompleted(data) {
        console.log('DEBUG - feed:message: Saved to disk image attached by user:', userUploadedImagePath, data);
    }

    
}

linksRef.on("value", function(snapshot) {
    var data = snapshot.val();
    console.log(prettyjson.render(data, options));
    // console.log('data---->', data);
    if (data) {
        var json = JSON.stringify(data);

        // console.log('json --->',json);
        console.log(beautify(json, {
            indent_size: 4
        }));
    }

});

var queueRef = rootRef.child('queue');
var options = {
    'specId': 'inicial',
    'numWorkers': 5 // una tarea completada por worker simultaneamente
        // 'sanitize': false,
        // 'suppressStack': true
};
// var ref = new Firebase('https://<your-firebase>.firebaseio.com/queue');
var queue = new Queue(queueRef, options, function(data, progress, resolve, reject) {
    // Read and process task data
    console.log('inicial specs', data);

    // Do some work
    progress(50);

    function errorFn(error) {
        reject(error);
    }

    function onCompleted(res) {
        console.log('oncompleted', res, 'data', data);
        resolve(data);
    }

    //using request
    getMock(4000 /*timeout*/ , false /*rechazar*/ )
        .then(onCompleted)
        .catch(errorFn);

    // using rp request-promise
    /*    getMockRp()
            .then(onCompleted)
            .catch(errorFn);*/
});

function getMock(delay, withError) {
    var url = 'http://requestb.in/xcctc6xc';


    return new Promise(function(resolve, reject) {

        request(url, function(error, response, body) {

            setTimeout(function() {

                if (error || withError) {
                    reject(error);
                } else {
                    resolve(body);
                }

            }, delay);


        });


    });

}

function getMockRp() {
    var url = 'http://requestb.in/xcctc6xc';
    return rp(url);

}



function testRequestBlue() {
    var url = 'http://requestb.in/xcctc6xc';

    function errorFn(error) {
        console.log(error);
    }

    function onCompleted(data) {
        console.log('oncompleted', data);
        // resolve(data);
    }
    /*calls async*/
    requestBlue.getAsync(url)
        .then(onCompleted)
        .catch(errorFn);
}


var optionsSecond = {
    'specId': 'second',
    'numWorkers': 5
};
// var ref = new Firebase('https://<your-firebase>.firebaseio.com/queue');
var queueSecond = new Queue(queueRef, optionsSecond, function(data, progress, resolve, reject) {
    // Read and process task data
    console.log('segundo specs', data);

    // Do some work
    progress(80);


    function errorFn(error) {
        reject(error);
    }

    function onCompleted(res) {
        console.log('oncompleted second', res);
        resolve(res);
    }

    //using request
    getMock(1000, false)
        .then(onCompleted)
        .catch(errorFn);

});
