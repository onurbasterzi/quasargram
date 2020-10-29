<template>
  <q-page class="constrain q-pa-md">

    <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <div class="bannercontainer bg-primary" v-if="showNotificationsBanner && pushNotificationsSupported">
        <div class="constrain">
          <q-banner
            class="bg-grey-4 q-mb-md"
          >
            <template v-slot:avatar>
              <q-icon name="eva-bell-outline" color="primary" />
            </template>
            Uygulamadan bildirim almak istermisiniz ?
            <template v-slot:action>
             <q-btn
                @click="enableNotifications"
                dense
                color="primary"
                flat
                label="EVET"
              />
              <q-btn
                @click="showNotificationsBanner=false"
                dense
                color="primary"
                flat
                label="SONRA"
              />
            <q-btn
                @click="neverShowNotificationsBanner"
                dense
                color="primary"
                flat
                label="ASLA"
              />
            </template>
          </q-banner>
        </div>
      </div>
    </transition>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if='!loadingPost && posts.length'>
         <q-card
            :key="post.id"
            bordered
            class="card-post q-mb-lg"
            :class="{'bg-red-1': post.offline}"
            flat
            v-for="post in posts"
          >
            <q-badge v-if='post.offline' color="red" class="badge-offline absolute-top-right">
             Offline olarak eklnedi
            </q-badge>
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-bold">onurbasterzi</q-item-label>
                <q-item-label caption>
                  {{post.location}}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />
            <q-img :src="post.photo" />
            <q-card-section>
              <div>{{post.caption}}</div>
              <div class="text-caption text-grey">{{post.date | formattedDate}}</div>
            </q-card-section>

          </q-card>
        </template>
        <template v-else-if='!loadingPost && !posts.length'>
          <h5 class="text-center text-grey">Görüntülenecek bir kayıt yok</h5>

        </template>
        <template v-else>
          <q-card flat bordered>
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" animation="fade" size="40px" />
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" animation="fade" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square animation="fade" />

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" animation="fade" />
              <q-skeleton type="text" width="50%" class="text-subtitle2" animation="fade" />
            </q-card-section>
          </q-card>
        </template>

      </div>
      <div class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="60px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">onurbasterzi</q-item-label>
            <q-item-label caption>
              Selçuk/İzmir
            </q-item-label>
          </q-item-section>
        </q-item>

      </div>
    </div>

  </q-page>
</template>

<script>
import { date } from 'quasar'
import { openDB} from 'idb'
let qs=require('qs')
export default {
  name: 'PageHome',
  data(){
    return{
      posts:[],
      loadingPost:false,
      showNotificationsBanner:false
    }
  },
  methods:{
    getPosts() {
      this.loadingPost = true
      this.$axios.get(`${process.env.API}/posts`)
        .then(response => {
          this.posts = response.data
          //this.posts = []
          this.loadingPost = false

          if(!navigator.onLine){

            this.getOfflinePosts()
          }
        }).catch(err => {
          this.$q.dialog({
            title: 'Error',
            message: 'Could not connect to server !!!'
          })
          this.loadingPost = false
        })
    },
    getOfflinePosts()
    {
     let db=openDB('workbox-background-sync').then(db=>{
       db.getAll('requests').then(failedReuests=>{
         failedReuests.forEach(failedReuests=>{
           if(failedReuests.queueName=='createPostQueue'){
             let request=new Request(failedReuests.requestData.url,failedReuests.requestData)
             request.formData().then(formData=>{
               let offlinePost={}
               offlinePost.id = formData.get('id')
               offlinePost.caption = formData.get('caption')
               offlinePost.loction = formData.get('location')
               offlinePost.date = parseInt(formData.get('date'))
               offlinePost.offline=true
               let reader=new FileReader()
               reader.readAsDataURL(formData.get('file'))
               reader.onloadend=()=>{
                 offlinePost.photo=reader.result
                 this.posts.unshift(offlinePost)
               }


             })
           }
         })
       }).catch(err=>{

       })
     })
    },
    listenForOfflinePostUploaded(){
      if(this.serviceWorkerSupoorted){
      const channel = new BroadcastChannel('sw-messages');
      channel.addEventListener('message', event => {
        console.log('Received', event.data);
        if(event.data.msg=='offline-post-uploaded'){
          let offlinePostCount=this.posts.filter(post=>post.offline==true).length
          this.posts[offlinePostCount-1].offline=false
        }
      });
      }
    }
    ,
    enableNotifications() {
      // Show the install prompt
      if(this.pushNotificationsSupported){
          Notification.requestPermission(result=>{
              this.neverShowNotificationsBanner()
              if(result=='granted'){
                //this.displayGrantedNotification()
                this.checkForExistingPushSubscription()
              }
          })
      }
    },
    checkForExistingPushSubscription(){
         if (this.serviceWorkerSupoorted && this.pushNotificationsSupported) {
        let reg
        navigator.serviceWorker.ready.then(swreq => {
          reg=swreq
          return swreq.pushManager.getSubscription()})
          .then(sub=>{
            if(!sub){
              this.createPushSubscription(reg)
            }
          })
      }
    },
    createPushSubscription(reg){
      let vapidPublicKey = 'BL7EryhTPwqt4YG0ib5whLHWANU0dGLxTwmbBGlTEJ1v9Q6g8i-RuCcuehJ0YOmViLOqKcAo_0A9glAYGbZ1440'
      let vapidPublicKeyConverted = this.urlBase64ToUint8Array(vapidPublicKey)
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKeyConverted
      }).then(newSub=>{

        let newSubData=newSub.toJSON(),
        newSubDataQS=qs.stringify(newSubData)
        console.log('newSubData:',newSubData);
        return this.$axios.post(`${process.env.API}/createSubscription?${newSubDataQS}`)
      }).then(response=>{
        this.displayGrantedNotification()
      }).catch(err=>{
        console.log('err:',err);
      })
    },
    displayGrantedNotification(){
      // new Notification("Bildirimler için kayıt oldunuz",{
      //   body:'Kayıt olduğunuz için teşekkür ederiz',
      //   icon:'icons/icon-128x128.png',
      //   image:'icons/icon-128x128.png',
      //   badge:'icons/icon-128x128.png',
      //   dir:'ltr',
      //   lang:'tr-TR',
      //   vibrate:[100,50,200],
      //   tag:'confirm-notification',
      //   renotify:true
      // })
      if (this.serviceWorkerSupoorted && this.pushNotificationsSupported) {
        navigator.serviceWorker.ready.then(swreq => {
          swreq.showNotification("Bildirimler için kayıt oldunuz", {
            body: 'Kayıt olduğunuz için teşekkür ederiz',
            icon: 'icons/icon-128x128.png',
            image: 'icons/icon-128x128.png',
            badge: 'icons/icon-128x128.png',
            dir: 'ltr',
            lang: 'tr-TR',
            vibrate: [100, 50, 200],
            tag: 'confirm-notification',
            renotify: true,
            actions:[{
              action:'hello',
              title:'Hello',
              icon:'icons/icon-128x128.png'
            },
            {
              action:'bye',
              title:'bye',
              icon:'icons/icon-128x128.png'
            }
            ]
          })
        })
      }
    },
    neverShowNotificationsBanner(){
      this.showNotificationsBanner=false
      this.$q.localStorage.set('neverShowNotificationsBanner',true)
    },
    initNotificationsBanner() {
      let neverShowNotificationsBanner = this.$q.localStorage.getItem('neverShowNotificationsBanner')

      if (!neverShowNotificationsBanner) {
          this.showNotificationsBanner=true
      }
    },
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

  },
  filters:{
    formattedDate(value){
      return date.formatDate(value, 'DD.MM.YYYY HH:mm')

    }
  },
  computed:{
    serviceWorkerSupoorted(){
      if('serviceWorker' in navigator){
        return true
      }
      return false
    },
    pushNotificationsSupported(){
        if('PushManager' in window){
          return true
        }
        return false
    }

  },
  activated(){
    this.getPosts()
  },
  created(){

    this.listenForOfflinePostUploaded()
    this.initNotificationsBanner()
  }
}
</script>
<style lang="sass">
.card-post
  .badge-offline
    border-top-left-radius: 0 !important
  .q-img
    min-height: 200px
</style>
