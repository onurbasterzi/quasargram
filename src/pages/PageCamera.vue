<template>
  <q-page class="constrain-more q-pa-md" >
    <div class="camera-frame q-pa-md">
      <video v-show="!imageCaptured"
        ref="video"
        class="full-width"
        autoplay
      />
      <canvas  v-show="imageCaptured" ref='canvas' class="full-width" height="240"/>
    </div>
      <div class="text-center q-pa-md">
        <div class="row">
          <div :class="hasCameraSupport?'offset-4 col-4':'offset-3 col-6'">
            <q-btn :disable='imageCaptured' v-if="hasCameraSupport" @click="captureImage" color="grey-10" icon="eva-camera"
              size="lg" round />
            <q-file v-else outlined v-model="imageUpload" @input="captureImageFallback" accept="image/*"
              label="Chose an image">
              <template v-slot:prepend>
                <q-icon name="eva-attach-outline" />
              </template>
            </q-file>

          </div>
          <div class="col-1"  v-if="hasCameraSupport">
            <div class="text-center q-pa-md" >
              <q-btn :disable='imageCaptured' v-if="hasCameraSupport" @click="changeCameraMode" color="grey-10" icon="eva-flip-outline"
                size="md" round />
            </div>
          </div>
        </div>





      <div class="row justify-center q-ma-md">
        <q-input v-model="post.caption" label="Caption" class="col col-sm-6" dense />
      </div>
      <div class="row justify-center q-ma-md">
        <q-input
          class="col col-sm-6"
          dense
          label="Location"
          v-model="post.location"
          :loading="locationLoading"
        >
          <template v-slot:append>
            <q-btn
             v-if="!locationLoading &&locationSupported"
              @click='getLocation'
              dense
              flat
              icon="eva-navigation-2-outline"
              round
            />
          </template>
        </q-input>
      </div>
      <div class="row justify-center q-mt-lg">
        <q-btn
          @click='addPost()'
          :disable='!post.caption || !post.photo'
          color="primary"
          label="POST IMAGE"
          rounded
          unelevated
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { format, uid } from 'quasar'
require('md-gum-polyfill')
export default {
  name: 'PageCamera',
  data(){
    return{
      post:{
        id:uid(),
        caption:'',
        location:'',
        photo:null,
        date:Date.now()
      },
      imageCaptured:false,
      imageUpload:[],
      hasCameraSupport:true,
      locationLoading:false,
      phoneCameraMode:'user'
    }
  },
  computed:{
    locationSupported(){
      if ('geolocation' in navigator) {
        return true
      }
      else {
        return false
      }

    },
    backgroundSyncSupported(){
      if('serviceWorker' in navigator && 'SyncManager' in window)
      return true
      else
      return false
    }

  },
  methods:{
    changeCameraMode(){
      this.phoneCameraMode=='user'?this.phoneCameraMode='environment':this.phoneCameraMode='user'
      this.disableCamera()
      this.initCamera()
      console.log(this.phoneCameraMode)
    },
    initCamera(){
     navigator.mediaDevices.getUserMedia({
       video:{facingMode:this.phoneCameraMode},

     }).then(stream=>{
       this.$refs.video.srcObject=stream
     }).catch(error=>{
       this.hasCameraSupport=false
     })
    },
    captureImage(){
      let video=this.$refs.video
      let canvas=this.$refs.canvas
      canvas.width=video.getBoundingClientRect().width
      canvas.height=video.getBoundingClientRect().height
      let context=canvas.getContext('2d')
      context.drawImage(video,0,0,canvas.width,canvas.height)
      this.imageCaptured=true
      this.post.photo=this.dataURItoBlob(canvas.toDataURL())
      this.disableCamera()
    },
    captureImageFallback(file){
      this.post.photo = file
       let canvas=this.$refs.canvas
      let context=canvas.getContext('2d')
      var reader = new FileReader()
      reader.onload =  event =>{
        var img = new Image();
        img.onload =  ()=> {
          canvas.width = img.width
          canvas.height = img.height
          context.drawImage(img, 0, 0)
          this.imageCaptured=true
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    },
    disableCamera(){
        this.$refs.video.srcObject.getVideoTracks().forEach(track => {
          track.stop()
        });
    },
    dataURItoBlob(dataURI) {
       // convert base64 to raw binary data held in a string
       // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
       var byteString = atob(dataURI.split(',')[1]);

       // separate out the mime component
       var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

       // write the bytes of the string to an ArrayBuffer
       var ab = new ArrayBuffer(byteString.length);

       // create a view into the buffer
       var ia = new Uint8Array(ab);

       // set the bytes of the buffer to the correct values
       for (var i = 0; i < byteString.length; i++) {
         ia[i] = byteString.charCodeAt(i);
       }

       // write the ArrayBuffer to a blob, and you're done
       var blob = new Blob([ab], {
         type: mimeString
       });
       return blob;
     },
    getLocation(){
      this.locationLoading=true
      navigator.geolocation.getCurrentPosition(position=>{
        this.getCityAndCountry(position)
      },err=>{
        this.locationError()
      },{timeout:7000})
    },
    getCityAndCountry(position){
      let apiUrl=`https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`
      this.$axios.get(apiUrl).then(result=>{
        console.log('result: ',result)
        this.locationSuccess(result)
      }).catch(err=>{
        this.locationError()
      })
    },
    locationSuccess(result){

      this.post.location=result.data.city
       if(result.data.region){
        this.post.location+= `, ${result.data.region}`
      }
      if(result.data.state){
        this.post.location+= `, ${result.data.state}`
      }
      this.locationLoading=false
    },
    locationError(){
      this.$q.dialog({
        title: 'Error',
        message: 'Location not found'
      })

      this.locationLoading=false
    }
    ,
    addPost() {

      this.$q.loading.show()



      let formData = new FormData()
      formData.append('id', this.post.id)
      formData.append('caption', this.post.caption)
      formData.append('location', this.post.location)
      formData.append('date', this.post.date)
      formData.append('file', this.post.photo, this.post.id + '.png')

      this.$axios.post(`${process.env.API}/createPost`, formData).
      then(response => {

        this.$router.push('/')
        this.$q.notify({
          message: 'Fotoğraf eklendi !',
          actions: [{
            label: 'Tamam',
            color: 'white'
          }]
        })
        this.$q.loading.hide()

      }).catch(err => {
        console.log(backgroundSyncSupported )
        if(!navigator.onLine && this.backgroundSyncSupported)
        {
            this.$q.notify('İşlem ofline olarak gerçekleştirildi...')
            this.$router.push('/')

        }
        else{
           this.$q.dialog({
          title: 'Error',
          message: 'Fotoğraf eklenirken bir hata oluştu'
        })
        this.$q.loading.hide()
        }

      })
    }
  },
  mounted(){
    this.initCamera()
  },
  beforeDestroy(){
    if(this.hasCameraSupport){
      this.disableCamera()
    }
  }
}
</script>
<style lang="sass">
.camera-frame
  border: 2px solid $grey-10
  border-radius: 10px
</style>
