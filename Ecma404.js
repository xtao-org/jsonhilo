import {JsonFeedbackType, unexpected} from './JsonLow.js'

const unexpectedEnd = (context) => {
  return {type: JsonFeedbackType.error, message: `Unexpected end ${context}!`}
}
export const Ecma404 = (next) => {
  let topValue = false
  const commas = []

  const openStruct = (codePoint) => {
    if (commas.length === 0) {
      if (topValue) return unexpected(codePoint, 'after the top-level value')
      else topValue = true
    }
    commas[commas.length - 1] = false
    commas.push(false)
  }

  const closeStruct = (codePoint) => {
    if (commas[commas.length - 1]) return unexpected(codePoint, `after ',' (trailing comma)`)
    commas.pop()
  }

  const openValue = (codePoint) => {
    if (commas.length === 0) {
      if (topValue) return unexpected(codePoint, `after the top-level value`)
      else topValue = true
    }
    commas[commas.length - 1] = false
  }

  const self = {
    openObject: openStruct,
    openArray: openStruct,
    closeObject: closeStruct,
    closeArray: closeStruct,
    comma: () => commas[commas.length - 1] = true,
    openFalse: openValue,
    openTrue: openValue,
    openNull: openValue,
    openNumber: openValue,
    openString: openValue,
    end: () => {
      if (topValue === false) return unexpectedEnd(`before the top-level value`)
    },
  }

  return new Proxy(next, {
    get: (target, prop, rec) => {
      const fn = self[prop]
      if (fn) return (...args) => {
        return fn(...args) || target[prop]?.(...args)
      }
      return target[prop]
    }
  })
}