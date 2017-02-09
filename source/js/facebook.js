import Task from 'data.task'
import element, { div, section, h3, p, ul, li, img, a, span, svg } from './template'
import { compose, curry, prop, head, last, map, chain, take, trace, lift } from './utils'

import '../scss/facebook.scss'

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

const header = heading =>
  div('.fb-album__header',
    h3('fb-album__heading', heading)
  )

const getImage = compose(prop('source'), last, prop('images'))

const icon = () => 
  svg('svg', '#fb_icon.fb-album__icon', { 'viewBox': '0 0 1024 1024', 'width': '100%' },
    svg('g', '.fb-album__icon--g', 
      svg('path', '.fb-album__icon--path', {
        'fill': '#ffffff',
        'd': `M621.273,512.188h-71.75V768H443.211V512.188h-50.562v-90.375h50.562v-58.5   C443.211,321.5,463.086,256,550.492,256l78.75,0.312v87.75h-57.156c-9.312,0-22.562,4.656-22.562,24.594v53.156h81.062   L621.273,512.188z M863.586,0h-704c-88.375,0-160,71.688-160,160v704c0,88.375,71.625,160,160,160h704c88.375,0,160-71.625,160-160   V160C1023.586,71.688,951.961,0,863.586,0`
      })
    )
  )

// {Image} -> {Image}
const attachHTML = album => ({
  ...album,
  html: section('.fb-album',
    div('.fb-album__inner',
      header(album.name),
      div('fb-album__list',
        ...album.photos.data.map(photo =>
          div('.fb-album__item',
            div('.fb-album__img', {
              style: {
                backgroundImage: `url(${photo.source})`
              }
            }),
            div('.fb-album__cover',
              a('.fb-album__link', { href: photo.link }, icon())
            )
          )
        )
      )
    )
  )
})


facebook(function(FB) {

  const albumAndImages = curry((album, photos) => ({
    ...album,
    photos: { data: take(4, photos.data) }
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
