<template>
  <q-page class="constrain q-pa-md">
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
export default {
  name: 'PageHome',
  data(){
    return{
      posts:[],
      loadingPost:false
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
    }
  },
  activated(){
    this.getPosts()
  },
  created(){

    this.listenForOfflinePostUploaded()
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
