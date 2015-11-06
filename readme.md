instalar node-inspector glabally

npm install -g node-inspector

node-debug -p 3550 --save-live-edit true index.js

--save-live-edit true

-------para probar queue

rootRef = new Firebase('https://scmlivelinks.firebaseio.com');

queueRef = rootRef.child('queue').child('tasks');

queueRef .push().set({
     author: "1",time: Firebase.ServerValue.TIMESTAMP,
     title: "The Turing Machine"
  });

queueRef .push().set({
     author: "2",time: Firebase.ServerValue.TIMESTAMP,
     title: "The Turing Machine"
  });

queueRef .push().set({
     author: "3",time: Firebase.ServerValue.TIMESTAMP,
     title: "The Turing Machine"
  });


queueRef .push().set({
     author: "4",time: Firebase.ServerValue.TIMESTAMP,
     title: "The Turing Machine"
  });

  for (var i = 0; i < 10; i++) {
    queueRef .push().set({
     author: i,time: Firebase.ServerValue.TIMESTAMP,
     title: "The Turing Machine"
  });
}

default spec
{
    "start_state": null,
    "in_progress_state": "in_progress",
    "finished_state": null,
    "error_state": "error",
    "timeout": 300000, // 5 minutes
    "retries": 0 // don't retry
  }



---------------------------------

specs=  = rootRef.child('queue').child('specs');

specs.child('inicial').set({
    "start_state": null,
    "in_progress_state": "in_progress",
    "finished_state": null,
    "error_state": "error",
    "timeout": 300000, // 5 minutes
    "retries": 0 // don't retry
  })




queueRef .push().set({
     author: "4",time: Firebase.ServerValue.TIMESTAMP,
     title: "The Turing Machine", "_state": "go_second"
  });