<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <q-card v-for="post in posts" :key="post.id" bordered class="card-post q-mb-lg" flat>
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
          <q-img :src="post.imgUrl" />
          <q-card-section>
            <div>{{post.caption}}</div>
            <div class="text-caption text-grey">{{post.date | formattedDate}}</div>
          </q-card-section>

        </q-card>
      </div>
      <div class="col-4 large-screen-only">
           <q-item class="fixed">
            <q-item-section avatar>
              <q-avatar size="60px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" >
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
export default {
  name: 'PageHome',
  data(){
    return{
      posts:[
        {
          id: 1,
          caption: 'Celcius Kütüphanesi Efes Selçuk',
          date: 1603453621469,
          location: 'Efes Harabeleri, Selçuk İzmir',
          imgUrl: 'https://images.unsplash.com/photo-1590533821454-ef0a004463dc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1080'

        }, {
          id: 2,
          caption: 'Celcius Kütüphanesi Efes Selçuk',
          date: 1603453621469,
          location: 'Efes Harabeleri, Selçuk İzmir',
          imgUrl: 'https://images.unsplash.com/photo-1590533821454-ef0a004463dc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1080'

        }, {
          id: 3,
          caption: 'Celcius Kütüphanesi Efes Selçuk',
          date: 1603453621469,
          location: 'Efes Harabeleri, Selçuk İzmir',
          imgUrl: 'https://images.unsplash.com/photo-1590533821454-ef0a004463dc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1080'

        }
      ]
    }
  },
  filters:{
    formattedDate(value){
      return date.formatDate(value, 'DD.MM.YYYY HH:mm')

    }
  }
}
</script>
<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>
