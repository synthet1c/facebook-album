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

const APP_ID = '775908159169504'
const TOKEN = 'cYEIsh0rs25OQQC8Ex2hXyCOut4'
const PROFILE = 'natgeo'
const ALBUM_ID = '10150310813623951'
const ACCESS_TOKEN = `${APP_ID}|${TOKEN}`


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
  FB.api(`/${albumId}/photos?access_token=${ACCESS_TOKEN}`, response => {
    resolve(response)
  })
})

const trace = name => x => (console.log(name, x), x)
const getImages = compose(map(compose(head, prop('images'))), prop('data'))
const attachHTML = img => {
  const html = document.createDocumentFragment()
  html.innerHTML = (
    `<figure class='photo'>
      <div class='photo__inner'>
        <div class='photo__content'>
          <div class='photo__frame' style='background-image:url(${img.images[0].source})'></div>
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
  .fork(
    e => console.error(e),
    s => console.log(s)
  ) 
