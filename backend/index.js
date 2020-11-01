/* dependendencies */

const express = require('express')
const admin = require('firebase-admin');
let inspect = require('util').inspect;
let Busboy = require('busboy');
let path=require('path')
let os=require('os')
let fs=require('fs')
let UUID=require('uuid-v4')
let webpush =require('web-push')


/* config */
const app = express()

/* config firebase*/
const serviceAccount = require('./serviceAccountKey.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "quasagram-25ba3.appspot.com"
});
const db = admin.firestore();
let bucket = admin.storage().bucket();

/* config webpush */
webpush.setVapidDetails(
  'mailto:test@test.com',
  'BL7EryhTPwqt4YG0ib5whLHWANU0dGLxTwmbBGlTEJ1v9Q6g8i-RuCcuehJ0YOmViLOqKcAo_0A9glAYGbZ1440', // public key
  'GSlg8ge5d6ML76h0_gn-TF8COS4d-WVgLCE9EOAXiGg' //private key
);




/* endpoint -posts */

app.get('/posts', (request, response) => {
  response.set('Access-Control-Allow-Origin','*')

  let posts = []
  db.collection('posts').orderBy('date','desc').get().then(snapshot=>{
    snapshot.forEach((doc) => {
      //console.log(doc.id, '=>', doc.data());
      posts.push(doc.data())
    });
    response.send(posts)
  })
})


/* endpoint -cereatePosts */

app.post('/createPost', (request, response) => {
  response.set('Access-Control-Allow-Origin','*')

  let uuid= UUID()

    let fields={}
    let fileData={}
    let photo

  var busboy = new Busboy({ headers: request.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      let filepath=path.join(os.tmpdir(),filename)
      file.pipe(fs.createWriteStream(filepath))
      fileData={filepath,mimetype}
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      fields[fieldname]=val
    });

    busboy.on('finish', function() {

      bucket.upload(
        fileData.filepath,
        {
          uploadType:'media',
          metadata:{
            metadata:{
              contentType:fileData.mimetype,
              firebaseStorageDownloadTokens:uuid
            }
          }
        },(err,uploadedFile) =>{
          if(!err){
            createDocument(uploadedFile)
          }
        }

      )
        function createDocument(uploadedFile){
          photo=`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
          db.collection('posts').doc(fields.id).set({
            id:fields.id,
            caption:fields.caption,
            location:fields.location,
            date:parseInt(fields.date),
            photo:photo

          }).then(()=>{
            sendPushNotification()

            response.send('Post added: '+fields.id)
          })
        }
        function sendPushNotification(){

          let subscriptions = []
          db.collection('subscriptions').get().then(snapshot=>{
            snapshot.forEach((doc) => {
              //console.log(doc.id, '=>', doc.data());
              subscriptions.push(doc.data())
            });

            return subscriptions
          }).then(subscriptions=>{

            subscriptions.forEach(subscription=>{
              const pushSubscription = {
                endpoint: subscription.endpoint,
                keys: {
                  auth: subscription.keys.auth,
                  p256dh: subscription.keys.p256dh
                }
              };
              let pushContent={
                title:'Yeni bir fotoğraf eklendi!!',
                body:'Yeni fotoğrafı görmek için tıklayın..',
                openUrl:'/#/',
                photo:photo
              }
              let pushContentStringified=JSON.stringify(pushContent)

              webpush.sendNotification(pushSubscription, pushContentStringified);
            })
          })
        }
    });
    request.pipe(busboy);


})


/* endpoint -cereateSubscription */

app.post('/createSubscription', (request, response) => {
  response.set('Access-Control-Allow-Origin','*')
  db.collection('subscriptions').add(request.query).then(docRef=>{
    response.send({
      message:'Subscription added!',
      postData:request.query
    })
  })
})



/* listen */
app.listen(process.env.PORT || 3000)
