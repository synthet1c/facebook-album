!function n(t,r,e){function o(i,c){if(!r[i]){if(!t[i]){var f="function"==typeof require&&require;if(!c&&f)return f(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var s=r[i]={exports:{}};t[i][0].call(s.exports,function(n){var r=t[i][1][n];return o(r?r:n)},s,s.exports,n,t,r,e)}return r[i].exports}for(var u="function"==typeof require&&require,i=0;i<e.length;i++)o(e[i]);return o}({1:[function(n){(function(n){"use strict";function t(n){if(Array.isArray(n)){for(var t=0,r=Array(n.length);t<n.length;t++)r[t]=n[t];return r}return Array.from(n)}var r=Object.assign||function(n){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var e in r)Object.prototype.hasOwnProperty.call(r,e)&&(n[e]=r[e])}return n};!function(){function e(n,t){this.fork=n,this.cleanup=t||function(){}}var o=function(n){return function r(e){return function(){for(var o=arguments.length,u=Array(o),i=0;o>i;i++)u[i]=arguments[i];var c=e.concat(u);return c.length<n.length?r(c):n.apply(void 0,t(c))}}([])},u=(o(function(n,t){return t[n]}),o(function(n,t){return t.map(n)}),o(function(n,t){return t.chain(n)}),o(function(n,t){return t.slice(0,n)})),i=function(n){return function(t){return console.log(n,t),t}},c=function(n,t,r,e){return t.map(n).ap(r).ap(e)},f="undefined"!=typeof setImmediate?setImmediate:"undefined"!=typeof n?n.nextTick:setTimeout;e.prototype.of=function(n){return new e(function(t,r){return r(n)})},e.of=e.prototype.of,e.prototype.rejected=function(n){return new e(function(t){return t(n)})},e.rejected=e.prototype.rejected,e.prototype.map=function(n){var t=this.fork,r=this.cleanup;return new e(function(r,e){return t(function(n){return r(n)},function(t){return e(n(t))})},r)},e.prototype.chain=function(n){var t=this.fork,r=this.cleanup;return new e(function(r,e){return t(function(n){return r(n)},function(t){return n(t).fork(r,e)})},r)},e.prototype.ap=function(n){function t(n){u(n[0]),i(n[1])}var r=this.fork,o=n.fork,u=this.cleanup,i=n.cleanup;return new e(function(n,e){function u(n){return function(r){return h?void 0:(n(r),l&&p?(f(function(){t(s)}),e(c(a))):r)}}function i(t){return h?void 0:(h=!0,n(t))}var c,a,s,l=!1,p=!1,h=!1,m=r(i,u(function(n){l=!0,c=n})),d=o(i,u(function(n){p=!0,a=n}));return s=[m,d]},t)},e.prototype.concat=function(n){function t(n){u(n[0]),i(n[1])}var r=this.fork,o=n.fork,u=this.cleanup,i=n.cleanup;return new e(function(n,e){function u(n){return function(r){return c?void 0:(c=!0,f(function(){t(i)}),n(r))}}var i,c=!1,a=r(u(n),u(e)),s=o(u(n),u(e));return i=[a,s]},t)},e.empty=function(){return new e(function(){})},e.prototype.empty=e.empty,e.prototype.toString=function(){return"Task"},e.prototype.orElse=function(n){var t=this.fork,r=this.cleanup;return new e(function(r,e){return t(function(t){return n(t).fork(r,e)},function(n){return e(n)})},r)},e.prototype.fold=function(n,t){var r=this.fork,o=this.cleanup;return new e(function(e,o){return r(function(t){return o(n(t))},function(n){return o(t(n))})},o)},e.prototype.cata=function(n){return this.fold(n.Rejected,n.Resolved)},e.prototype.swap=function(){var n=this.fork,t=this.cleanup;return new e(function(t,r){return n(function(n){return r(n)},function(n){return t(n)})},t)},e.prototype.bimap=function(n,t){var r=this.fork,o=this.cleanup;return new e(function(e,o){return r(function(t){return e(n(t))},function(n){return o(t(n))})},o)},e.prototype.rejectedMap=function(n){var t=this.fork,r=this.cleanup;return new e(function(r,e){return t(function(t){return r(n(t))},function(n){return e(n)})},r)};var s="775908159169504",l="cYEIsh0rs25OQQC8Ex2hXyCOut4",p=s+"|"+l,h=document.querySelector("#facebook_album"),m=h.dataset,d=m.profile,v=m.album,y=function(n){var t=document.createElement("script");window.fbAsyncInit=function(){FB.init({appId:s,xfbml:!0,version:"v2.3",access_token:p});var t=o(function(n,t,e){return r({},t,{profile:n,photos:{data:u(6,e.data)}})}),e=c(t,b(d),w(v),g(v)).map(x).map(i("applied"));n(e)},t.src="//connect.facebook.net/en_US/sdk.js",document.head.appendChild(t)},b=function(n){return new e(function(t,r){FB.api("/"+n,{access_token:p},r)})},g=function(n){return new e(function(t,r){FB.api("/"+n+"/photos",{access_token:p},r)})},w=function(n){return new e(function(t,r){FB.api("/"+n,{access_token:p},r)})},_=function(n){return div(".fb-album__header",h3("fb-album__heading",n))},k=function(){return svg("svg","#fb_icon.fb-album__icon",{viewBox:"0 0 1024 1024",width:"100%"},svg("g",".fb-album__icon--g",svg("path",".fb-album__icon--path",{fill:"#ffffff",d:["M621.273,512.188h-71.75V768H443.211V512.188h-50.562v-90.375h50.562v-58.5","C443.211,321.5,463.086,256,550.492,256l78.75,0.312v87.75h-57.156c-9.312,0-22.562,4.656-22.562,24.594v53.156h81.062","L621.273,512.188z","M863.586,0h-704c-88.375,0-160,71.688-160,160v704c0,88.375,71.625,160,160,160h704c88.375,0,160-71.625,160-160","V160C1023.586,71.688,951.961,0,863.586,0"].join(" ")})))},T=function(n){return section(".fb-album.loading",div(".fb-album__inner",_(n.name),div.apply(void 0,[".fb-album__list"].concat(t(n.photos.data.map(function(n){return div(".fb-album__item",div(".fb-album__img",{style:{backgroundImage:"url("+n.source+")"}}),div(".fb-album__cover",a(".fb-album__link",{href:n.link},div(".fb-album__text",k()))))}))))))},x=function(n){return r({},n,{html:T(n)})},E=function(n){return Promise.all(n.map(function(n){return new Promise(function(t,r){var e=new Image;e.onload=function(){return t(e)},e.onerror=r,e.src=n.source})}))};y(function(n){n.fork(function(n){return console.error(n)},function(n){var t=document.querySelector("#facebook_album");t.appendChild(n.html),E(n.photos.data).then(function(){t.querySelector(".fb-album").classList.remove("loading")})})})}()}).call(this,n("_process"))},{_process:2}],2:[function(n,t){function r(){throw new Error("setTimeout has not been defined")}function e(){throw new Error("clearTimeout has not been defined")}function o(n){if(s===setTimeout)return setTimeout(n,0);if((s===r||!s)&&setTimeout)return s=setTimeout,setTimeout(n,0);try{return s(n,0)}catch(t){try{return s.call(null,n,0)}catch(t){return s.call(this,n,0)}}}function u(n){if(l===clearTimeout)return clearTimeout(n);if((l===e||!l)&&clearTimeout)return l=clearTimeout,clearTimeout(n);try{return l(n)}catch(t){try{return l.call(null,n)}catch(t){return l.call(this,n)}}}function i(){d&&h&&(d=!1,h.length?m=h.concat(m):v=-1,m.length&&c())}function c(){if(!d){var n=o(i);d=!0;for(var t=m.length;t;){for(h=m,m=[];++v<t;)h&&h[v].run();v=-1,t=m.length}h=null,d=!1,u(n)}}function f(n,t){this.fun=n,this.array=t}function a(){}var s,l,p=t.exports={};!function(){try{s="function"==typeof setTimeout?setTimeout:r}catch(n){s=r}try{l="function"==typeof clearTimeout?clearTimeout:e}catch(n){l=e}}();var h,m=[],d=!1,v=-1;p.nextTick=function(n){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];m.push(new f(n,t)),1!==m.length||d||o(c)},f.prototype.run=function(){this.fun.apply(null,this.array)},p.title="browser",p.browser=!0,p.env={},p.argv=[],p.version="",p.versions={},p.on=a,p.addListener=a,p.once=a,p.off=a,p.removeListener=a,p.removeAllListeners=a,p.emit=a,p.binding=function(){throw new Error("process.binding is not supported")},p.cwd=function(){return"/"},p.chdir=function(){throw new Error("process.chdir is not supported")},p.umask=function(){return 0}},{}]},{},[1]);