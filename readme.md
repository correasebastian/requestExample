>node-debug -p 3550 index.js

-------para probar queue

rootRef = new Firebase('https://scmlivelinks.firebaseio.com');
U {k: Yh, path: L, n: ae, lc: false}
queueRef = rootRef.child('queue').child('tasks');
U {k: Yh, path: L, n: ae, lc: false}
queueRef .push().set({
     author: "alanisawesome",
     title: "The Turing Machine"
  });

queueRef .push().set({
     author: "kike",
     title: "The Turing Machine"
  });

queueRef .push().set({
     author: "kike",time: Firebase.ServerValue.TIMESTAMP,
     title: "The Turing Machine"
  });


queueRef .push().set({
     author: "kike",time: Firebase.ServerValue.TIMESTAMP,rejectObj:{msg:'fallo a proposito'},
     title: "The Turing Machine"
  });