import Task from 'data.task'
// import {Future} from 'ramda-fantasy'
import template, { div, section, h3, p, ul, li, img } from './template'
import {
  compose,
  curry,
  prop,
  head,
  last,
  map,
  chain,
  take,
  trace
} from './utils'
/* # UTILS */

const test = 'test'
const APP_ID = '775908159169504'
const TOKEN = 'cYEIsh0rs25OQQC8Ex2hXyCOut4'
const PROFILE = 'TwelveBoardStore'
const ALBUM_ID = '1776962582516324'
const ACCESS_TOKEN = `${APP_ID}|${TOKEN}`
const photoFields = ['height','icon','images','link','name','picture','width','source']
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
    
export const getPhotos = albumId => new Task((reject, resolve) => {
  FB.api(`/${albumId}/photos`, {
    fields: photoFields,
    access_token: ACCESS_TOKEN
  } ,resolve)
})

export const getAlbum = albumId => new Task((reject, resolve) => {
  FB.api(`/${albumId}`, {
    access_token: ACCESS_TOKEN
  } ,resolve)
})



const getImage = compose(prop('source'), last, prop('images'))

// {Image} -> {Image}
const attachHTML = album => ({
  ...album, 
  html: section('.fb-album', 
    div('.fb-album__inner', 
      div('fb-album__header', 
        h3('fb-album__heading', album.name)
      ),
      div('fb-album__list',
        ...album.photos.data.map(photo => 
          div('.fb-album__item', 
            img('.fb-album__img', { src: photo.source }),
            div('.fb-album__cover', '')
          )
        )
      )
    )  
  )
})

const lift = (fn, o1, o2) => o1.map(fn).ap(o2)

facebook(function(FB) {
  
  const albumAndImages = curry((album, photos) => ({
    ...album,
    photos
  }))

  const lifted = lift(albumAndImages, getAlbum(ALBUM_ID), getPhotos(ALBUM_ID))
    .map(trace('applied'))
    .map(attachHTML)
  
  lifted.fork(
    e => console.error(e),
    album => {
      document.querySelector('#app').appendChild(album.html)
      console.log({ album })
    }
  )

})
