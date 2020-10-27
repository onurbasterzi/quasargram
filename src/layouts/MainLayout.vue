<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      class="bg-white text-grey-10"
      bordered
    >
      <q-toolbar class="constrain">

        <q-btn
          class="large-screen-only q-mr-sm"
          to='/camera'
          size="18px"
          flat
          icon="eva-camera-outline"
          round
          dense
        />
        <q-separator
          class="large-screen-only"
          spaced
          vertical
        />
        <q-toolbar-title class="text-grand-hotel text-weight-medium">
          Instagram
        </q-toolbar-title>
        <q-btn
          class="large-screen-only"
          to='/'
          size="18px"
          flat
          icon="eva-home-outline"
          round
          dense
        />


      </q-toolbar>
    </q-header>
    <q-footer class=" bg-white " bordered>

<transition
  appear
  enter-active-class="animated fadeIn"
  leave-active-class="animated fadeOut"
>
      <div class="bannercontainer bg-primary" v-if="showAppInstallBanner">
        <div class="constrain">
           <q-banner inline-actions dense class="bg-primary text-white">
     <template v-slot:avatar>
        <q-avatar icon="eva-camera-outline" color="white" text-color="grey" font-size="22px" />
      </template>
      Anasayfaya Ekle
      <template v-slot:action>
        <q-btn @click="installApp" flat label="EVET" dense />
        <q-btn @click="showAppInstallBanner=false" flat label="SONRA" dense/>
        <q-btn @click="neverShowAppInstallBanner" flat label="ASLA" dense />
      </template>
    </q-banner>
        </div>
      </div>
</transition>



   <q-tabs

         class="text-grey-10 small-screen-only"
         active-color="primary"
         indicator-color="transparent"
       >
      <q-route-tab
        to='/'
        icon="eva-home-outline"
      />
       <q-route-tab
          to='/camera'
          icon="eva-camera-outline"
        />
      </q-tabs>

    </q-footer>



    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

let deferredPrompt;
export default {
  name: 'MainLayout',
  data () {
    return {
      showAppInstallBanner:false

    }
  },
  methods:{
    installApp() {
      // Show the install prompt
      this.showAppInstallBanner=false
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          this.neverShowAppInstallBanner()
        } else {
          console.log('User dismissed the install prompt');
        }
      });
    },
    neverShowAppInstallBanner(){
      this.showAppInstallBanner=false
      this.$q.localStorage.set('neverShowAppInstallBanner',true)
    }
  },
  mounted() {
   let neverShowAppInstallBanner= this.$q.localStorage.getItem('neverShowAppInstallBanner')

    if(!neverShowAppInstallBanner){
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      setTimeout(()=>{
        this.showAppInstallBanner=true
      },1000)

    });
    }
  }
}
</script>
<style lang="sass">
  .q-toolbar
    @media (min-width: $breakpoint-sm-min)
      height: 77px
  .q-toolbar__title
    font-size: 30px
    @media (max-width: $breakpoint-xs-max)
      text-align: center
  .q-footer
    .q-tab__icon
      font-size: 30px

</style>
