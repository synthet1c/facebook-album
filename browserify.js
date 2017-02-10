(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  var curry = function curry(fn) {
    return function _curry(allArgs) {
      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var currArgs = allArgs.concat(args);
        return currArgs.length < fn.length ? _curry(currArgs) : fn.apply(undefined, _toConsumableArray(currArgs));
      };
    }([]);
  };

  var compose = function compose(a) {
    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return rest.length === 0 ? a : function (c) {
      return a(compose.apply(undefined, rest)(c));
    };
  };

  var prop = curry(function (key, obj) {
    return obj[key];
  });
  var head = function head(arr) {
    return arr[0];
  };
  var last = function last(arr) {
    return arr[arr.length - 1];
  };
  var map = curry(function (f, obj) {
    return obj.map(f);
  });
  var chain = curry(function (f, obj) {
    return obj.chain(f);
  });
  var take = curry(function (n, a) {
    return a.slice(0, n);
  });
  var trace = function trace(name) {
    return function (x) {
      return console.log(name, x), x;
    };
  };

  var liftA2 = function liftA2(fn, o1, o2) {
    return o1.map(fn).ap(o2);
  };
  var liftA3 = function liftA3(fn, o1, o2, o3) {
    return o1.map(fn).ap(o2).ap(o3);
  };
  var liftA4 = function liftA4(fn, o1, o2, o3, o4) {
    return o1.map(fn).ap(o2).ap(o3).ap(o4);
  };
  var liftA5 = function liftA5(fn, o1, o2, o3, o4, o5) {
    return o1.map(fn).ap(o2).ap(o3).ap(o4).ap(o5);
  };
  var liftA6 = function liftA6(fn, o1, o2, o3, o4, o5, o6) {
    return o1.map(fn).ap(o2).ap(o3).ap(o4).ap(o5).ap(o6);
  };

  'use strict';

  /**
   * A helper for delaying the execution of a function.
   * @private
   * @summary (Any... -> Any) -> Void
   */
  var delayed = typeof setImmediate !== 'undefined' ? setImmediate : typeof process !== 'undefined' ? process.nextTick : /* otherwise */
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

    this.cleanup = cleanup || function () {};
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
    return new Task(function (_, resolve) {
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
    return new Task(function (reject) {
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

    return new Task(function (reject, resolve) {
      return fork(function (a) {
        return reject(a);
      }, function (b) {
        return resolve(f(b));
      });
    }, cleanup);
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

    return new Task(function (reject, resolve) {
      return fork(function (a) {
        return reject(a);
      }, function (b) {
        return f(b).fork(reject, resolve);
      });
    }, cleanup);
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

    return new Task(function (reject, resolve) {
      var func,
          funcLoaded = false;
      var val,
          valLoaded = false;
      var rejected = false;
      var allState;

      var thisState = forkThis(guardReject, guardResolve(function (x) {
        funcLoaded = true;
        func = x;
      }));

      var thatState = forkThat(guardReject, guardResolve(function (x) {
        valLoaded = true;
        val = x;
      }));

      function guardResolve(setter) {
        return function (x) {
          if (rejected) {
            return;
          }

          setter(x);
          if (funcLoaded && valLoaded) {
            delayed(function () {
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

      return allState = [thisState, thatState];
    }, cleanupBoth);
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

    return new Task(function (reject, resolve) {
      var done = false;
      var allState;
      var thisState = forkThis(guard(reject), guard(resolve));
      var thatState = forkThat(guard(reject), guard(resolve));

      return allState = [thisState, thatState];

      function guard(f) {
        return function (x) {
          if (!done) {
            done = true;
            delayed(function () {
              cleanupBoth(allState);
            });
            return f(x);
          }
        };
      }
    }, cleanupBoth);
  };

  // -- Monoid ------------------------------------------------------------
  /**
   * Returns a Task that will never resolve
   *
   * @summary Void → Task[α, _]
   */
  Task.empty = function _empty() {
    return new Task(function () {});
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

    return new Task(function (reject, resolve) {
      return fork(function (a) {
        return f(a).fork(reject, resolve);
      }, function (b) {
        return resolve(b);
      });
    }, cleanup);
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

    return new Task(function (reject, resolve) {
      return fork(function (a) {
        return resolve(f(a));
      }, function (b) {
        return resolve(g(b));
      });
    }, cleanup);
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

    return new Task(function (reject, resolve) {
      return fork(function (a) {
        return resolve(a);
      }, function (b) {
        return reject(b);
      });
    }, cleanup);
  };

  /**
   * Maps both sides of the disjunction.
   *
   * @summary @Task[α, β] => (α → γ), (β → δ) → Task[γ, δ]
   */
  Task.prototype.bimap = function _bimap(f, g) {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(function (reject, resolve) {
      return fork(function (a) {
        return reject(f(a));
      }, function (b) {
        return resolve(g(b));
      });
    }, cleanup);
  };

  /**
   * Maps the left side of the disjunction (failure).
   *
   * @summary @Task[α, β] => (α → γ) → Task[γ, β]
   */
  Task.prototype.rejectedMap = function _rejectedMap(f) {
    var fork = this.fork;
    var cleanup = this.cleanup;

    return new Task(function (reject, resolve) {
      return fork(function (a) {
        return reject(f(a));
      }, function (b) {
        return resolve(b);
      });
    }, cleanup);
  };

  var APP_ID = '775908159169504';
  var TOKEN = 'cYEIsh0rs25OQQC8Ex2hXyCOut4';
  var ACCESS_TOKEN = APP_ID + '|' + TOKEN;
  var ALBUM_ELEMENT = document.querySelector('#facebook_album');
  var _ALBUM_ELEMENT$datase = ALBUM_ELEMENT.dataset,
      PROFILE = _ALBUM_ELEMENT$datase.profile,
      ALBUM_ID = _ALBUM_ELEMENT$datase.album;

  // _ -> Task [Album]

  var facebook = function facebook(cb) {
    var script = document.createElement('script');
    window.fbAsyncInit = function () {
      FB.init({
        appId: APP_ID,
        xfbml: true,
        version: 'v2.3',
        access_token: ACCESS_TOKEN
      });

      var albumAndImages = curry(function (profile, album, photos) {
        return _extends({}, album, {
          profile: profile,
          photos: { data: take(6, photos.data) }
        });
      });

      var lifted = liftA3(albumAndImages, getProfile(PROFILE), getAlbum(ALBUM_ID), getPhotos(ALBUM_ID)).map(attachHTML).map(trace('applied'));

      cb(lifted);
    };
    script.src = '//connect.facebook.net/en_US/sdk.js';
    document.head.appendChild(script);
  };

  // getProfile :: s -> Task Profile
  var getProfile = function getProfile(profileName) {
    return new Task(function (reject, resolve) {
      FB.api('/' + profileName, { access_token: ACCESS_TOKEN }, resolve);
    });
  };

  // getProfileAlbums :: s -> Task [Album]
  var getProfileAlbums = function getProfileAlbums(profileName) {
    return new Task(function (reject, resolve) {
      FB.api('/' + profileName + '/albums', { access_token: ACCESS_TOKEN }, resolve);
    });
  };

  // getPhotos :: i -> Task [Photo]
  var getPhotos = function getPhotos(albumId) {
    return new Task(function (reject, resolve) {
      FB.api('/' + albumId + '/photos', { access_token: ACCESS_TOKEN }, resolve);
    });
  };

  // getAlbum :: i -> Task Album
  var getAlbum = function getAlbum(albumId) {
    return new Task(function (reject, resolve) {
      FB.api('/' + albumId, { access_token: ACCESS_TOKEN }, resolve);
    });
  };

  // getPhoto :: i -> Task Photo
  var getPhoto = function getPhoto(photoId) {
    return new Task(function (reject, resolve) {
      FB.api('/' + photoId, { access_token: ACCESS_TOKEN }, resolve);
    });
  };

  // getCoverPhoto :: s -> Task Album
  var getCoverPhoto = function getCoverPhoto(album) {
    return new Task(function (reject, resolve) {
      FB.api('/' + album.cover_photo, { access_token: ACCESS_TOKEN }, function (cover) {
        return resolve(_extends({}, album, { cover: cover }));
      });
    });
  };

  // header :: s -> HTMLElement
  var header = function header(heading) {
    return div('.fb-album__header', h3('fb-album__heading', heading));
  };

  // icon :: _ -> SVGElement
  var icon = function icon() {
    return svg('svg', '#fb_icon.fb-album__icon', { viewBox: '0 0 1024 1024', width: '100%' }, svg('g', '.fb-album__icon--g', svg('path', '.fb-album__icon--path', {
      fill: '#ffffff',
      d: ['M621.273,512.188h-71.75V768H443.211V512.188h-50.562v-90.375h50.562v-58.5', 'C443.211,321.5,463.086,256,550.492,256l78.75,0.312v87.75h-57.156c-9.312,0-22.562,4.656-22.562,24.594v53.156h81.062', 'L621.273,512.188z', 'M863.586,0h-704c-88.375,0-160,71.688-160,160v704c0,88.375,71.625,160,160,160h704c88.375,0,160-71.625,160-160', 'V160C1023.586,71.688,951.961,0,863.586,0'].join(' ')
    })));
  };

  // albumTemplate :: Album -> HTMLElement
  var albumTemplate = function albumTemplate(album) {
    return section('.fb-album.loading', div('.fb-album__inner', header(album.name), div.apply(undefined, ['.fb-album__list'].concat(_toConsumableArray(album.photos.data.map(function (photo) {
      return div('.fb-album__item', div('.fb-album__img', {
        style: { backgroundImage: 'url(' + photo.source + ')' }
      }), div('.fb-album__cover', a('.fb-album__link', { href: photo.link }, div('.fb-album__text',
      // p('.fb-album__location', photo.place.location.city)
      icon()))));
    }))))));
  };

  // attachHTML :: Album -> Album
  var attachHTML = function attachHTML(album) {
    return _extends({}, album, { html: albumTemplate(album) });
  };

  var loadImages = function loadImages(images) {
    return Promise.all(images.map(function (image) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          return resolve(img);
        };
        img.onerror = reject;
        img.src = image.source;
      });
    }));
  };

  facebook(function (album) {
    album.fork(function (e) {
      return console.error(e);
    }, function (album) {
      var app = document.querySelector('#facebook_album');

      app.appendChild(album.html);

      loadImages(album.photos.data).then(function () {
        app.querySelector('.fb-album').classList.remove('loading');
      });
    });
  });
})();

}).call(this,require('_process'))
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
