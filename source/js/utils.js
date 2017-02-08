export const curry = fn => {
  return (function _curry(allArgs) {
    return (...args) => {
      const currArgs = allArgs.concat(args)
      return (currArgs.length < fn.length)
        ? _curry(currArgs)
        : fn(...currArgs)
    }
  })([])
}

export const compose = (a, ...rest) => 
  rest.length === 0
    ? a
    : c => a(compose(...rest)(c))

export const prop = curry((key, obj) => obj[key])
export const head = arr => arr[0]
export const last = arr => arr[arr.length - 1]
export const map = curry((f, obj) => obj.map(f))
export const chain = curry((f, obj) => obj.chain(f))
export const take = curry((n, a) => a.slice(0, n))
export const trace = name => x => (console.log(name, x), x)


