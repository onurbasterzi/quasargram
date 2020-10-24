/* dependendencies */

const express = require('express')

/* config */
const app = express()



/* endpoint -posts */

app.get('/posts', (request, response) => {
  let posts=[
    {
      caption:'Efes Anfi Tiyatrosu',
      location:'Selçuk',
    },
    {
      caption:'Celcus Kütüphanesi',
      location:'Efes Selçuk',
    }
  ]
  response.send(posts)
  console.log("Endpoint is working :)")
})

/* listen */
app.listen(process.env.PORT || 3000)
