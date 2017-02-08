import Task from 'data.task'
import {Future} from 'ramda-fantasy'

/* # UTILS */
const curry = fn => {
  const _curry = (allArgs) => {
    return (...args) => {
      const currArgs = allArgs.concat(args)
      return (currArgs.length < fn.length)
        ? _curry(currArgs)
        : fn(...currArgs)
    }
  }
  return _curry([])
}

const compose = (a, ...rest) => 
  rest.length === 0
    ? a
    : c => a(compose(...rest)(c))

const prop = curry((key, obj) => obj[key])
const head = arr => arr[0]
const last = arr => arr[0]
const map = curry((f, obj) => obj.map(f))
const chain = curry((f, obj) => obj.chain(f))
const take = curry((n, a) => a.slice(0, n))


const test = 'test'
const APP_ID = '775908159169504'
const TOKEN = 'cYEIsh0rs25OQQC8Ex2hXyCOut4'
const PROFILE = 'TwelveBoardStore'
const ALBUM_ID = '1776962582516324'
const ACCESS_TOKEN = `${APP_ID}|${TOKEN}`
const photoFields = 'fields=id,created_time,from,height,icon,images,link,name,picture,updated_time,width,source'
const param = obj => Object.keys(obj).reduce((acc, x) => (acc[x]), '')

// _ -> Future [Image]
export const facebook = (cb) => {
  if (typeof FB !== 'undefined') {
    return cb(FB)
  }
  const script = document.createElement('script')
  window.fbAsyncInit = () => {
    FB.init({
      appId: APP_ID,
      xfbml: true,
      version: 'v2.3'
    })
    cb(FB)
  }
  script.src = '//connect.facebook.net/en_US/sdk.js'
  document.head.appendChild(script)
}
    
export const getPhotos = albumId => new Future((reject, resolve) => {
  FB.api(`/${albumId}/photos`, {
    fields: photoFields,
    access_token: ACCESS_TOKEN
  } ,resolve)
})

export const getAlbum = albumId => new Future((reject, resolve) => {
  FB.api(`/${albumId}`, {
    access_token: ACCESS_TOKEN
  } ,resolve)
})



const trace = name => x => (console.log(name, x), x)
const getImage = compose(prop('source'), last, prop('images'))

// {Image} -> {Image}
const attachHTML = img => {
  const html = document.createElement('figure')
  html.className = 'photo'
  html.style.backgroundImage = `url(${getImage(img)})`
  html.style.paddingTop = '56.25%'
  html.style.backgroundSize = 'cover'
  return Object.assign({ html }, img )
}

//const getFacebookImage = facebook()
//  .chain(getPhotos(ALBUM_ID))
//.map(prop('data'))
// .map(take(8))
//.map(map(attachHTML))
//.map(trace('attachedHTML'))

const lift = (fn, o1, o2) => o1.map(fn).ap(o2)

//const getFacebookAlbum = facebook()
//  .chain(getAlbum(ALBUM_ID))


const albumAndImages = curry((album, images) => {
  console.log({ album, images })
})

facebook(function(FB) {
  const lifted = lift(albumAndImages, getAlbum(ALBUM_ID), getPhotos(ALBUM_ID))
  lifted.fork(
    e => console.error(e),
    (album, images) => console.log(album, images)
  )
})

//lifted
//  .fork(
//    e => console.error(e),
//    images => {
//      console.log('image', images)
//      const app = document.querySelector('#app')
//      images.forEach(image => {
//        app.appendChild(image.html)
//      })
//    }
//  )


