import { Future } from 'ramda-fantasy'
import _ from 'ramda'
const {
  compose,
  pipe,
  prop,
  path,
  head,
  map,
  chain
} = _

const test = 'test'
const APP_ID = '775908159169504'
const TOKEN = 'cYEIsh0rs25OQQC8Ex2hXyCOut4'
const PROFILE = 'natgeo'
const ALBUM_ID = '10150310813623951'
const ACCESS_TOKEN = `${APP_ID}|${TOKEN}`
const photoFields = '&fields=id,created_time,from,height,icon,images,link,name,picture,updated_time,width,source'
const param = obj => Object.keys(obj).reduce((acc, x) => (acc[x]), '')

// _ -> Future [Image]
export const facebook = () =>
  typeof FB !== 'undefined'
    ? new Future(res => res(FB))
    : new Future((reject, resolve) => {
      const script = document.createElement('script')
      window.fbAsyncInit = () => {
        FB.init({
          appId: APP_ID,
          xfbml: true,
          version: 'v2.3'
        })
        resolve(FB)
      }
      script.src = '//connect.facebook.net/en_US/sdk.js'
      document.head.appendChild(script)
    })


export const getPhotos = albumId => FB => new Future((reject, resolve) => {
  FB.api(`/${albumId}/photos?access_token=${ACCESS_TOKEN}${photoFields}`, resolve)
})

const trace = name => x => (console.log(name, x), x)
const getImage = compose(prop('source'), _.last, prop('images'))

// {Image} -> {Image}
const attachHTML = img => {
  const html = document.createElement('div')
  html.innerHTML = (
    `<figure class='photo'>
      <div class='photo__inner'>
        <div class='photo__content'>
          <img class='photo__frame' src='${getImage(img)}' />
          <div class='photo__title'>
            ${img.name}
          </div>
        </div>
      </div>
    </figure>`
  )
  return Object.assign({ html }, img )
}

facebook()
  .chain(getPhotos(ALBUM_ID))
  .map(prop('data'))
  .map(map(attachHTML))
  .map(trace('attachedHTML'))
  .fork(
    e => console.error(e),
    images => {
      console.log('image', images)
      const app = document.querySelector('#app')
      console.log({ app })
      images.forEach(image => {
        console.log(app, image.html)
        app.appendChild(image.html)
      })
    }
  )
