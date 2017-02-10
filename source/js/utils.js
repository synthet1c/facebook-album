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

export const identity = x => x
export const prop = curry((key, obj) => obj[key])
export const head = arr => arr[0]
export const last = arr => arr[arr.length - 1]
export const map = curry((f, obj) => obj.map(f))
export const chain = curry((f, obj) => obj.chain(f))
export const take = curry((n, a) => a.slice(0, n))
export const trace = name => x => (console.log(name, x), x)

export const liftA2 = (fn, o1, o2) => o1.map(fn).ap(o2)
export const liftA3 = (fn, o1, o2, o3) => o1.map(fn).ap(o2).ap(o3)
export const liftA4 = (fn, o1, o2, o3, o4) => o1.map(fn).ap(o2).ap(o3).ap(o4)
export const liftA5 = (fn, o1, o2, o3, o4, o5) => o1.map(fn).ap(o2).ap(o3).ap(o4).ap(o5)
export const liftA6 = (fn, o1, o2, o3, o4, o5, o6) => o1.map(fn).ap(o2).ap(o3).ap(o4).ap(o5).ap(o6)

