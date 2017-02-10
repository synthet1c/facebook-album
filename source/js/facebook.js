import Task from 'data.task'
import element, { div, section, h3, p, ul, li, img, a, span, svg } from './template'
import { compose, curry, prop, head, last, map, chain, take, trace, liftA3, identity } from './utils'

import '../scss/facebook.scss'

const APP_ID = '775908159169504'
const TOKEN = 'cYEIsh0rs25OQQC8Ex2hXyCOut4'
const ACCESS_TOKEN = `${APP_ID}|${TOKEN}`
const ALBUM_ELEMENT = document.querySelector('#facebook_album')
const { profile: PROFILE, album: ALBUM_ID } = ALBUM_ELEMENT.dataset

// _ -> Task [Album]
export const facebook = (cb) => {
  const script = document.createElement('script')
  window.fbAsyncInit = () => {
    FB.init({
      appId: APP_ID,
      xfbml: true,
      version: 'v2.3',
      access_token: ACCESS_TOKEN
    })
    
    const albumAndImages = curry((profile, album, photos) => ({
      ...album,
      profile,
      photos: { data: take(6, photos.data) }
    }))

    const lifted = liftA3(
      albumAndImages, 
      getProfile(PROFILE), 
      getAlbum(ALBUM_ID),
      getPhotos(ALBUM_ID)
    )
    .map(attachHTML)
    // .map(trace('applied'))

    cb(lifted)
  }
  script.src = '//connect.facebook.net/en_US/sdk.js'
  document.head.appendChild(script)
}

// getProfile :: s -> Task Profile
export const getProfile = profileName => new Task((reject, resolve) => {
  FB.api(`/${profileName}`, {
    access_token: ACCESS_TOKEN
  } ,resolve)
})

// getProfileAlbums :: s -> Task [Album]
export const getProfileAlbums = profileName => new Task((reject, resolve) => {
  FB.api(`/${profileName}/albums`, {
    access_token: ACCESS_TOKEN
  } ,resolve)
})

// getPhotos :: i -> Task [Photo]
export const getPhotos = albumId => new Task((reject, resolve) => {
  FB.api(`/${albumId}/photos`, {
    access_token: ACCESS_TOKEN
  } ,resolve)
})

// getAlbum :: i -> Task Album
export const getAlbum = albumId => new Task((reject, resolve) => {
  FB.api(`/${albumId}`, {
    access_token: ACCESS_TOKEN
  } ,resolve)
})

// getPhoto :: i -> Task Photo
export const getPhoto = photoId => new Task((reject, resolve) => {
  FB.api(`/${photoId}`, {
    access_token: ACCESS_TOKEN
  } ,resolve)
})

// getCoverPhoto :: s -> Task Album
export const getCoverPhoto = album => new Task((reject, resolve) => {
  FB.api(`/${album.cover_photo}`, {
    access_token: ACCESS_TOKEN
  }, cover => resolve({...album, cover}))
})

// header :: s -> HTMLElement
const header = heading =>
  div('.fb-album__header',
    h3('fb-album__heading', heading)
  )

// icon :: _ -> SVGElement
const icon = () => 
  svg('svg', '#fb_icon.fb-album__icon', { viewBox: '0 0 1024 1024', width: '100%' },
    svg('g', '.fb-album__icon--g', 
      svg('path', '.fb-album__icon--path', {
        fill: '#ffffff',
        d: [
          `M621.273,512.188h-71.75V768H443.211V512.188h-50.562v-90.375h50.562v-58.5`,
          `C443.211,321.5,463.086,256,550.492,256l78.75,0.312v87.75h-57.156c-9.312,0-22.562,4.656-22.562,24.594v53.156h81.062`,
          `L621.273,512.188z`,
          `M863.586,0h-704c-88.375,0-160,71.688-160,160v704c0,88.375,71.625,160,160,160h704c88.375,0,160-71.625,160-160`,
          `V160C1023.586,71.688,951.961,0,863.586,0`
        ].join(' ')
      })
    )
  )

// albumTemplate :: Album -> HTMLElement
const albumTemplate = album => 
  section('.fb-album.loading',
    div('.fb-album__inner',
      div('.fb-album__list',
        ...album.photos.data.map(photo =>
          div('.fb-album__item',
            div('.fb-album__img', {
              style: {
                backgroundImage: 'url(' + photo.source + ')'
              }
            }),
            div('.fb-album__cover',
              a('.fb-album__link', { href: photo.link }, 
                div('.fb-album__text',
                  icon(),
                  // p('.fb-album__location', photo.place.location.city)
                )
              )
            )
          )
        )
      )
    )
  )



// attachHTML :: Album -> Album
const attachHTML = album => ({
  ...album,
  html: albumTemplate(album)
})





