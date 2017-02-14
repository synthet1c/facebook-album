import { facebook } from './facebook'
import loader from './loader'

import { APP_ID, TOKEN, PROFILE } from '../../credentials.json'

const loadImages = images => Promise.all(
  images.map(image =>
    new Promise((resolve, reject) => {
      const img = new Image
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = image.source
    })
  )
)

facebook({
  appId: APP_ID,
  token: TOKEN,
  profile: PROFILE
}, function(album) {

  album.fork(
    e => console.error(e),
    album => {
      const app = document.querySelector('#facebook_album')

      app.appendChild(album.html)

      loadImages(album.photos.data)
        .then(() => {
          app.querySelector('.fb-album').classList.remove('loading')
        })
    }
  )

})
