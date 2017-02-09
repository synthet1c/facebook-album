import { facebook } from './facebook'

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

facebook(function(album) {

  album.fork(
    e => console.error(e),
    album => {
      const app = document.querySelector('#app')
      
      app.appendChild(album.html)
      
      loadImages(album.photos.data)
        .then(() => {
          app.querySelector('.fb-album').classList.remove('loading')    
        })
    }
  )

})
