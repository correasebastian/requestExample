var request = require('request');
var unirest = require('unirest');
var Firebase = require('firebase');
var beautify = require('js-beautify').js_beautify;


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


linksRef.on("value", function(snapshot) {
    var data = snapshot.val();
    // console.log('data---->', data);
    if (data) {
    	var json=JSON.stringify(data);

    	// console.log('json --->',json);
        console.log(beautify(json, {
            indent_size: 4
        }));
    }

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});
