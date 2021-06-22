import {JsonEventType, JsonFeedbackType, unexpected} from './JsonLow.js'

const unexpectedEnd = (context) => {
  return {type: JsonFeedbackType.error, message: `Unexpected end ${context}!`}
}
export const Ecma404 = (next) => {
  let topValue = false
  const commas = []

  return {
    push: (event) => {
      switch (event.type) {
        case JsonEventType.openObject:
        case JsonEventType.openArray: {
          if (commas.length === 0) {
            if (topValue) return unexpected(event.codePoint, 'after the top-level value')
            else topValue = true
          }
          commas[commas.length - 1] = false
          commas.push(false)
          break
        } 
        case JsonEventType.closeObject: 
        case JsonEventType.closeArray: {
          if (commas[commas.length - 1]) return unexpected(event.codePoint, `after ',' (trailing comma)`)
          commas.pop()
          break
        }
        case JsonEventType.comma: {
          commas[commas.length - 1] = true
          break
        }
        case JsonEventType.openFalse:
        case JsonEventType.openNull:
        case JsonEventType.openNumber:
        case JsonEventType.openString:
        case JsonEventType.openTrue:
          if (commas.length === 0) {
            if (topValue) return unexpected(event.codePoint, `after the top-level value`)
            else topValue = true
          }
          commas[commas.length - 1] = false
          break
      }
      return next.push(event)
    },
    end: () => {
      if (topValue === false) return unexpectedEnd(`before the top-level value`)
      return next.end()
    },
    send: (msg) => next.send(msg),
  }
}