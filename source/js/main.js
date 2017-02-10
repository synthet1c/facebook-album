(function() {
  const curry = fn => {
    return (function _curry(allArgs) {
      return (...args) => {
        const currArgs = allArgs.concat(args);
        return currArgs.length < fn.length ? _curry(currArgs) : fn(...currArgs);
      };
    })([]);
  };

  const compose = (a, ...rest) =>
    rest.length === 0 ? a : c => a(compose(...rest)(c));

  const prop = curry((key, obj) => obj[key]);
  const head = arr => arr[0];
  const last = arr => arr[arr.length - 1];
  const map = curry((f, obj) => obj.map(f));
  const chain = curry((f, obj) => obj.chain(f));
  const take = curry((n, a) => a.slice(0, n));
  const trace = name => x => (console.log(name, x), x);

  const liftA2 = (fn, o1, o2) => o1.map(fn).ap(o2);
  const liftA3 = (fn, o1, o2, o3) => o1.map(fn).ap(o2).ap(o3);
  const liftA4 = (fn, o1, o2, o3, o4) => o1.map(fn).ap(o2).ap(o3).ap(o4);
  const liftA5 = (fn, o1, o2, o3, o4, o5) =>
    o1.map(fn).ap(o2).ap(o3).ap(o4).ap(o5);
  const liftA6 = (fn, o1, o2, o3, o4, o5, o6) =>
    o1.map(fn).ap(o2).ap(o3).ap(o4).ap(o5).ap(o6);

  'use strict';

  /**
   * A helper for delaying the execution of a function.
   * @private
   * @summary (Any... -> Any) -> Void
   */
  var delayed = typeof setImmediate !== 'undefined'
    ? setImmediate
    : typeof process !== 'undefined' ? process.nextTick : /* otherwise */
      setTimeout;

  // -- Implementation ---------------------------------------------------
  /**
   * The `Task[α, β]` structure represents values that depend on time. This
   * allows one to model time-based effects explicitly, such that one can have
   * full knowledge of when they're dealing with delayed computations, latency,
   * or anything that can not be computed immediately.
   *
   * A common use for this structure is to replace the usual Continuation-Passing
   * Style form of programming, in order to be able to compose and sequence
   * time-dependent effects using the generic and powerful monadic operations.
   *
   * @class
   * @summary
   * ((α → Void), (β → Void) → Void), (Void → Void) → Task[α, β]
   *
   * Task[α, β] <: Chain[β]
   *               , Monad[β]
   *               , Functor[β]
   *               , Applicative[β]
   *               , Semigroup[β]
   *               , Monoid[β]
   *               , Show
   */
  function Task(computation, cleanup) {
    this.fork = computation;

    this.cleanup = cleanup || function() {
      };
  }

  /**
   * Constructs a new `Task[α, β]` containing the single value `β`.
   *
   * `β` can be any value, including `null`, `undefined`, or another
   * `Task[α, β]` structure.
   *
   * @summary β → Task[α, β]
   */
  Task.prototype.of = function _of(b) {
    return new Task(function(_, resolve) {
      return resolve(b);
    });
  };

  Task.of = Task.prototype.of;

  /**
   * Constructs a new `Task[α, β]` containing the single value `α`.
   *
   * `α` can be any value, including `null`, `undefined`, or another
   * `Task[α, β]` structure.
   *
   * @summary α → Task[α, β]
   */
  Task.prototype.rejected = function _rejected(a) {
    return new Task(function(reject) {
      return reject(a);
    });
  };

  Task.rejected = Task.prototype.rejected;

  // -- Functor ----------------------------------------------------------
  /**
   * Transforms the successful value of the `Task[α, β]` using a regular unary
   * function.
   *
   * @summary @Task[α, β] => (β → γ) → Task[α, γ]
   */
  Task.prototype.map = function _map(f) {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(
      function(reject, resolve) {
        return fork(
          function(a) {
            return reject(a);
          },
          function(b) {
            return resolve(f(b));
          }
        );
      },
      cleanup
    );
  };

  // -- Chain ------------------------------------------------------------
  /**
   * Transforms the succesful value of the `Task[α, β]` using a function to a
   * monad.
   *
   * @summary @Task[α, β] => (β → Task[α, γ]) → Task[α, γ]
   */
  Task.prototype.chain = function _chain(f) {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(
      function(reject, resolve) {
        return fork(
          function(a) {
            return reject(a);
          },
          function(b) {
            return f(b).fork(reject, resolve);
          }
        );
      },
      cleanup
    );
  };

  // -- Apply ------------------------------------------------------------
  /**
   * Applys the successful value of the `Task[α, (β → γ)]` to the successful
   * value of the `Task[α, β]`
   *
   * @summary @Task[α, (β → γ)] => Task[α, β] → Task[α, γ]
   */
  Task.prototype.ap = function _ap(that) {
    var forkThis = this.fork;
    var forkThat = that.fork;
    var cleanupThis = this.cleanup;
    var cleanupThat = that.cleanup;

    function cleanupBoth(state) {
      cleanupThis(state[0]);
      cleanupThat(state[1]);
    }

    return new Task(
      function(reject, resolve) {
        var func, funcLoaded = false;
        var val, valLoaded = false;
        var rejected = false;
        var allState;

        var thisState = forkThis(
          guardReject,
          guardResolve(function(x) {
            funcLoaded = true;
            func = x;
          })
        );

        var thatState = forkThat(
          guardReject,
          guardResolve(function(x) {
            valLoaded = true;
            val = x;
          })
        );

        function guardResolve(setter) {
          return function(x) {
            if (rejected) {
              return;
            }

            setter(x);
            if (funcLoaded && valLoaded) {
              delayed(function() {
                cleanupBoth(allState);
              });
              return resolve(func(val));
            } else {
              return x;
            }
          };
        }

        function guardReject(x) {
          if (!rejected) {
            rejected = true;
            return reject(x);
          }
        }

        return allState = [ thisState, thatState ];
      },
      cleanupBoth
    );
  };

  // -- Semigroup ------------------------------------------------------------
  /**
   * Selects the earlier of the two tasks `Task[α, β]`
   *
   * @summary @Task[α, β] => Task[α, β] → Task[α, β]
   */
  Task.prototype.concat = function _concat(that) {
    var forkThis = this.fork;
    var forkThat = that.fork;
    var cleanupThis = this.cleanup;
    var cleanupThat = that.cleanup;

    function cleanupBoth(state) {
      cleanupThis(state[0]);
      cleanupThat(state[1]);
    }

    return new Task(
      function(reject, resolve) {
        var done = false;
        var allState;
        var thisState = forkThis(guard(reject), guard(resolve));
        var thatState = forkThat(guard(reject), guard(resolve));

        return allState = [ thisState, thatState ];

        function guard(f) {
          return function(x) {
            if (!done) {
              done = true;
              delayed(function() {
                cleanupBoth(allState);
              });
              return f(x);
            }
          };
        }
      },
      cleanupBoth
    );
  };

  // -- Monoid ------------------------------------------------------------
  /**
   * Returns a Task that will never resolve
   *
   * @summary Void → Task[α, _]
   */
  Task.empty = function _empty() {
    return new Task(function() {
    });
  };

  Task.prototype.empty = Task.empty;

  // -- Show -------------------------------------------------------------
  /**
   * Returns a textual representation of the `Task[α, β]`
   *
   * @summary @Task[α, β] => Void → String
   */
  Task.prototype.toString = function _toString() {
    return 'Task';
  };

  // -- Extracting and recovering ----------------------------------------
  /**
   * Transforms a failure value into a new `Task[α, β]`. Does nothing if the
   * structure already contains a successful value.
   *
   * @summary @Task[α, β] => (α → Task[γ, β]) → Task[γ, β]
   */
  Task.prototype.orElse = function _orElse(f) {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(
      function(reject, resolve) {
        return fork(
          function(a) {
            return f(a).fork(reject, resolve);
          },
          function(b) {
            return resolve(b);
          }
        );
      },
      cleanup
    );
  };

  // -- Folds and extended transformations -------------------------------
  /**
   * Catamorphism. Takes two functions, applies the leftmost one to the failure
   * value, and the rightmost one to the successful value, depending on which one
   * is present.
   *
   * @summary @Task[α, β] => (α → γ), (β → γ) → Task[δ, γ]
   */
  Task.prototype.fold = function _fold(f, g) {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(
      function(reject, resolve) {
        return fork(
          function(a) {
            return resolve(f(a));
          },
          function(b) {
            return resolve(g(b));
          }
        );
      },
      cleanup
    );
  };

  /**
   * Catamorphism.
   *
   * @summary @Task[α, β] => { Rejected: α → γ, Resolved: β → γ } → Task[δ, γ]
   */
  Task.prototype.cata = function _cata(pattern) {
    return this.fold(pattern.Rejected, pattern.Resolved);
  };

  /**
   * Swaps the disjunction values.
   *
   * @summary @Task[α, β] => Void → Task[β, α]
   */
  Task.prototype.swap = function _swap() {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(
      function(reject, resolve) {
        return fork(
          function(a) {
            return resolve(a);
          },
          function(b) {
            return reject(b);
          }
        );
      },
      cleanup
    );
  };

  /**
   * Maps both sides of the disjunction.
   *
   * @summary @Task[α, β] => (α → γ), (β → δ) → Task[γ, δ]
   */
  Task.prototype.bimap = function _bimap(f, g) {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(
      function(reject, resolve) {
        return fork(
          function(a) {
            return reject(f(a));
          },
          function(b) {
            return resolve(g(b));
          }
        );
      },
      cleanup
    );
  };

  /**
   * Maps the left side of the disjunction (failure).
   *
   * @summary @Task[α, β] => (α → γ) → Task[γ, β]
   */
  Task.prototype.rejectedMap = function _rejectedMap(f) {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(
      function(reject, resolve) {
        return fork(
          function(a) {
            return reject(f(a));
          },
          function(b) {
            return resolve(b);
          }
        );
      },
      cleanup
    );
  };

  const APP_ID = '775908159169504';
  const TOKEN = 'cYEIsh0rs25OQQC8Ex2hXyCOut4';
  const ACCESS_TOKEN = `${APP_ID}|${TOKEN}`;
  const ALBUM_ELEMENT = document.querySelector('#facebook_album');
  const { profile: PROFILE, album: ALBUM_ID } = ALBUM_ELEMENT.dataset;

  // _ -> Task [Album]
  const facebook = cb => {
    const script = document.createElement('script');
    window.fbAsyncInit = () => {
      FB.init({
        appId: APP_ID,
        xfbml: true,
        version: 'v2.3',
        access_token: ACCESS_TOKEN
      });

      const albumAndImages = curry((profile, album, photos) => ({
        ...album,
        profile,
        photos: { data: take(6, photos.data) }
      }));

      const lifted = liftA3(
        albumAndImages,
        getProfile(PROFILE),
        getAlbum(ALBUM_ID),
        getPhotos(ALBUM_ID)
      )
        .map(attachHTML)
        .map(trace('applied'));

      cb(lifted);
    };
    script.src = '//connect.facebook.net/en_US/sdk.js';
    document.head.appendChild(script);
  };

  // getProfile :: s -> Task Profile
  const getProfile = profileName => new Task((reject, resolve) => {
    FB.api(`/${profileName}`, { access_token: ACCESS_TOKEN }, resolve);
  });

  // getProfileAlbums :: s -> Task [Album]
  const getProfileAlbums = profileName => new Task((reject, resolve) => {
    FB.api(`/${profileName}/albums`, { access_token: ACCESS_TOKEN }, resolve);
  });

  // getPhotos :: i -> Task [Photo]
  const getPhotos = albumId => new Task((reject, resolve) => {
    FB.api(`/${albumId}/photos`, { access_token: ACCESS_TOKEN }, resolve);
  });

  // getAlbum :: i -> Task Album
  const getAlbum = albumId => new Task((reject, resolve) => {
    FB.api(`/${albumId}`, { access_token: ACCESS_TOKEN }, resolve);
  });

  // getPhoto :: i -> Task Photo
  const getPhoto = photoId => new Task((reject, resolve) => {
    FB.api(`/${photoId}`, { access_token: ACCESS_TOKEN }, resolve);
  });

  // getCoverPhoto :: s -> Task Album
  const getCoverPhoto = album => new Task((reject, resolve) => {
    FB.api(
      `/${album.cover_photo}`,
      { access_token: ACCESS_TOKEN },
      cover => resolve({ ...album, cover })
    );
  });

  // header :: s -> HTMLElement
  const header = heading =>
    div('.fb-album__header', h3('fb-album__heading', heading));

  // icon :: _ -> SVGElement
  const icon = () =>
    svg(
      'svg',
      '#fb_icon.fb-album__icon',
      { viewBox: '0 0 1024 1024', width: '100%' },
      svg(
        'g',
        '.fb-album__icon--g',
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
    );

  // albumTemplate :: Album -> HTMLElement
  const albumTemplate = album => section(
    '.fb-album.loading',
    div(
      '.fb-album__inner',
      header(album.name),
      div(
        '.fb-album__list',
        ...album.photos.data.map(
          photo => div(
            '.fb-album__item',
            div('.fb-album__img', {
              style: { backgroundImage: 'url(' + photo.source + ')' }
            }),
            div(
              '.fb-album__cover',
              a(
                '.fb-album__link',
                { href: photo.link },
                div(
                  '.fb-album__text',
                  // p('.fb-album__location', photo.place.location.city)
                  icon()
                )
              )
            )
          )
        )
      )
    )
  );

  // attachHTML :: Album -> Album
  const attachHTML = album => ({ ...album, html: albumTemplate(album) });

  const loadImages = images => Promise.all(
    images.map(
      image => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = image.source;
      })
    )
  );

  facebook(function(album) {
    album.fork(e => console.error(e), album => {
      const app = document.querySelector('#facebook_album');

      app.appendChild(album.html);

      loadImages(album.photos.data).then(() => {
        app.querySelector('.fb-album').classList.remove('loading');
      });
    });
  });
})();
