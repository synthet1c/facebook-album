const element = curryRest(createElement)

export default element
export const p = element('p')
export const a = element('a')
export const h3 = element('h3')
export const ul = element('ul')
export const li = element('li')
export const div = element('div')
export const img = element('img')
export const span = element('span')
export const section = element('section')
export const svg = curryRest(createSVG)

 /*
 * createElement
 *
 * recurse through element tree and return DOM html
 *
 * @param  {String}  type  element node name
 * @param  {String}  selector  css selector to apply to the element
 * @param  {Object|HTMLElement}  ...children  attrs to apply, or children
*/
function createElement(type, selector, children) {
  const element = document.createElement(type)
  applySelector(selector, element)
  if (children[0].constructor === Object) {
    applyAttributes(children.shift(), element)
  }
  children.forEach(child => {
    if (typeof child === 'string') {
      child = document.createTextNode(child)
    }
    if (child instanceof HTMLElement || child instanceof Text || child instanceof SVGElement) {
      element.appendChild(child)
    }
  })
  return element
}

 /*
 * createSVG
 *
 * recurse through element tree and return DOM html
 *
 * @param  {String}  type  element node name
 * @param  {String}  selector  css selector to apply to the element
 * @param  {Object|HTMLElement}  ...children  attrs to apply, or children
*/
function createSVG(type, selector, children) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', type)
  applySelector(selector, element)
  if (children[0].constructor === Object) {
    const attrs = children.shift();
    for (let attr in attrs) {
      element.setAttributeNS(null, attr, attrs[attr])
    }
  }
  children.forEach(child => {
    if (child instanceof SVGElement) {
      element.appendChild(child)
    }
  })
  return element
}

 /*
 * curryRest
 *
 * curry function with last named argument transformed
 * into an array
 *
 * @param  {Function}  fn  function to curry
*/
function curryRest(fn) {
  const ll = fn.length
  return (function _curry(cache){
    return (...args) => {
      const all = cache.concat(args)
      return all.length < ll
        ? _curry(all)
        : fn(...[].concat(all.slice(0,ll - 1), [all.slice(ll - 1)]))
    }
  })([])
}

 /*
 * applySelector
 *
 * add selectors to the input element using css selectors
 *
 * @param  {string}  selector  css selector to apply to element
 * @param  {HTMLElement}  element  html element to add classes to
*/
function applySelector(selector, element) {
	selector.replace(/(\.|\#)*([\w\d-_]+)/g, (_, type, name) => {
		switch (type) {
			case '.':
				element.classList.add(name)
				break;
      case '#':
			default:
				element.id = name
		}
	})
}

function applyStyles(styles, element) {
  Object.keys(styles).forEach(prop => {
    element.style[prop] = styles[prop]
  })
}

 /*
 * applyAttributes
 *
 * add attributes to an element, non native attributes are applied
 * as data-attr
 *
 * @param  {Object}  attrs  attributes to apply to element
 * @param  {HTMLElement}  element  element to apply attributes to
*/
function applyAttributes(attrs, element) {
	Object.keys(attrs).forEach(attr => {
    if (attr === 'style') {
      applyStyles(attrs.style, element)
    }
    else if (attr.charAt(0) === '!') {
      let prop = attr.slice(1)
      element.setAttribute(prop, attrs[attr])
    }
    else if (attr in element) {
			element[attr] = attrs[attr]
		}
		else {
			element.dataset[attr] = attrs[attr]
		}
	})
}
