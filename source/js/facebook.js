import Task from 'data.task'
import element, { div, section, h3, p, ul, li, img, a, span, svg } from './template'
import loader from './loader'
import {
  compose, curry, prop, head, last,
  map, chain, take, trace, liftA3, liftA2,
  identity, sort, minus, not
} from './utils'

import '../scss/facebook.scss'
import '../scss/slideshow.scss'
// https://graph.facebook.com/oauth/access_token?grant_type=client_credentials&client_id=1411024562271943&client_secret=3ec29d3e965312775f2cd02a16eb0a1c
const sortByDate = xs => {
  const copy = xs.slice();

  copy.sort((a, b) =>
    a.type !== 'normal'
      ? 1
      : new Date(b.updated_time).getTime() - new Date(a.updated_time).getTime())

  return copy
}

const first = xs => xs[0]
const pluckLatestAlbum = compose(prop('id'), first, sortByDate, prop('data'))
// _ -> Task [Album]
export const facebook = ({ appId, token }, cb) => {
  const script = document.createElement('script')
  const access_token = `${appId}|${token}`
  window.fbAsyncInit = () => {
    FB.init({
      appId,
      xfbml: true,
      version: 'v2.3',
      access_token
    })

    const albumAndImages = curry((profile, album, photos) => ({
      ...album,
      profile,
      photos: { data: compose(take(Infinity), sortByDate)(photos.data) }
    }))

    getUploadedPhotos(PROFILE, { access_token })
      .fork(trace('error'), trace('success'))

    const latestAlbum = getProfileAlbums(PROFILE, { access_token })
      .map(pluckLatestAlbum)

    const lifted = latestAlbum.chain(
      album => liftA3(
        albumAndImages,
        getProfile(PROFILE, { access_token }),
        getAlbum(album, { access_token }),
        getUploadedPhotos(PROFILE, { access_token })
      )
    )
    .map(attachHTML)
    .map(trace('applied'))

    cb(lifted)
  }
  script.src = '//connect.facebook.net/en_US/sdk.js'
  document.head.appendChild(script)
}

// facebookGet :: (s -> o) -> Task FB.api
const facebookGet = (uri, params) => new Task((reject, resolve) => {
  let cached = localStorage.getItem(`fb-album__${uri}`)

  if (cached) {
    cached = JSON.parse(cached)
    if (Date.now() - cached.timestamp <= cached.expiry) {
      resolve(cached.value)
      return
    }
  }

  FB.api(
    uri,
    params,
    response => {
      if ('error' in response) {
        return reject(response.error)
      }

      localStorage.setItem(`fb-album__${uri}`, JSON.stringify({
        value: response,
        timestamp: Date.now(),
        expiry: 600000
      }))
      resolve(response)
    }
  )
})

// getProfile :: s -> Task Profile
export const getProfile = (profileName, params) => facebookGet(`/${profileName}`, params)

// getProfileAlbums :: s -> Task [Album]
export const getProfileAlbums = (profileName, params) => facebookGet(`/${profileName}/albums`, params)

// getPhotos :: i -> Task [Photo]
export const getPhotos = (albumId, params) => facebookGet(`/${albumId}/photos`, params)

// getPhotos :: i -> Task [Photo]
export const getUploadedPhotos = (profile, params) => facebookGet(`/${profile}/photos?type=uploaded`, params)

// getAlbum :: i -> Task Album
export const getAlbum = (albumId, params) => facebookGet(`/${albumId}`, params)

// getPhoto :: i -> Task Photo
export const getPhoto = (photoId, params) => facebookGet(`/${photoId}`, params)

// getCoverPhoto :: s -> Task Album
export const getCoverPhoto = (album, params) => facebookGet(`/${album.cover_photo}`, params)

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
const albumTemplateOld = album =>
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
                  p('.fb-album__location', photo.place.location.city)
                )
              )
            )
          )
        )
      )
    )
  )

const pascalCase = str => str.replace(/[^\d\w]+/g, '-')
const uniqueID = () => 'Ox' + (Date.now()).toString(16)

console.log(uniqueID())

const checkbox = curry((className, name) => {
  const id = uniqueID()
  return div('.checkbox',
    element(
      'input',
      `#${id}.checkbox__input`,
      { type: 'checkbox', name: pascalCase(name) }
    ),
    element('label', '.checkbox__label', { htmlFor: id }, name)
  )
})


const slideshow = album =>
  section('.slideshow',
    div('.slideshow__inner',
      div('.slideshow__content',
        div('#photo.slideshow__viewer', {
          style: { backgroundImage: `url(${album.photos.data[0].source})`}
        }),
        div('.slideshow__heading',
          checkbox('.slideshow__checkbox', album.name),
        )
      )
    ),
    div('.thumbnails',
      div('.thumbnails__list',
        ...take(3, album.photos.data).map(photo =>
          div('.thumbnails__item',
            div('.thumbnails__img', {
              style: { backgroundImage: `url(${photo.source})`}
            })
          )
        )
      )
    )
  )

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
                  icon()
                )
              )
            )
          )
        )
      )
    ),
    slideshow(album)
  )



// attachHTML :: Album -> Album
const attachHTML = album => ({
  ...album,
  html: albumTemplate(album)
})
