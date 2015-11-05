var request = require('request');
var unirest = require('unirest');
var Firebase = require('firebase');
var beautify = require('js-beautify').js_beautify;
var prettyjson = require('prettyjson');
var Queue = require('firebase-queue');
var Promise = require('bluebird');
var rp = require('request-promise');
var requestBlue = Promise.promisifyAll(require('request'));

var RSVP = require('rsvp'); //lightweigth promises used in firebase queue

setTimeout(function() {

    console.log('requestBlue', requestBlue);

}, 2000);

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

// var newPostRef = linksRef.push();
//   newPostRef.set({
//     author: "gracehop",
//     title: "Announcing COBOL, a New Programming Language"
//   });

//  linksRef.push().set({
//     author: "alanisawesome",
//     title: "The Turing Machine"
//   });

//   // This is equivalent to the calls to push().set(...) above
//   linksRef.push({
//     author: "gracehop",
//     title: "Announcing COBOL, a New Programming Language"
//   });
var options = {
    noColor: false
};



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

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
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

    // // Finish the task asynchronously
    // setTimeout(function() {

    //     if (data.rejectObj) {
    //         reject(data.rejectObj.msg);

    //     } else {
    //         resolve();
    //     }

    // }, 1000);
    function errorFn(error) {
        reject(error);
    }

    function onCompleted(res) {
        console.log('oncompleted', res , 'data', data);
        resolve(data);
    }

    //using request
    getMock(4000/*timeout*/, false /*rechazar*/)
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
    getMock(3000, true)
        .then(onCompleted)
        .catch(errorFn);

});
// testRequestBlue();

/*

var data = {
    "groups": {
        "group1" {
            "group_name": "Administrators",
            "group_description": "Users who can do anything!",
            "no_of_users": 2,
            "users": {
                "user1": {
                    "username": "john",
                    "full_name": "John Vincent",
                    "created_at": "9th Feb 2015",
                    "updates": {
                        "update1": {
                            "update_text": "New feature launched!",
                            "created_at": "13th Feb 2015",
                            "sent_by": "user2"
                        }
                    }
                },
                "user2": {
                    "username": "chris",
                    "full_name": "Chris Mathews",
                    "created_at": "11th Feb 2015"
                }
            }
        },
        "group2" {
            "group_name": "Moderators",
            "group_description": "Users who can only moderate!",
            "no_of_users": 1,
            "users": {
                "user1": {
                    "username": "john",
                    "full_name": "John Vincent",
                    "created_at": "9th Feb 2015"
                }
            },
            ,
            "updates": {
                "update2": {
                    "update_text": "Users should expect blackout tomorrow!",
                    "created_at": "19th Feb 2015",
                    "sent_by": "user1"
                }
            }
        }
    }
}*/
