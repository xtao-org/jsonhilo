import {JsonEventType, CodePoint} from './JsonLow.js'

const {_t_, _n_, _b_, _r_, _f_} = CodePoint

export const JsonHighEventType = {
  openArray: 'JsonHighEventType.openArray',
  closeArray: 'JsonHighEventType.closeArray',
  openObject: 'JsonHighEventType.openObject',
  closeObject: 'JsonHighEventType.closeObject',

  key: 'JsonHighEventType.key',
  value: 'JsonHighEventType.value',
}
export const JsonHighFeedbackType = {
  ok: 'JsonHighFeedbackType.ok',
  nok: 'JsonHighFeedbackType.nok',
  error: 'JsonHighFeedbackType.error',
}
export const JsonEventToJsonHighEvent = (next) => {
  let mode = 'top'
  let stringBuffer = ''
  let numberBuffer = ''
  let hexBuf = []
  const feedbackQueue = []
  const self = {
    push: (event) => {
      const feedback = []
      if (feedbackQueue.length > 0) {
        feedback.push(feedbackQueue.pop())
      }
      const {type} = event
      switch (mode) {
        case 'top': switch (type) {
          case JsonEventType.openString:
          case JsonEventType.openKey: {
            stringBuffer = ''
            mode = 'string'
            break
          } 
          case JsonEventType.openNumber: {
            numberBuffer = String.fromCharCode(event.codePoint)
            mode = 'number'
            break
          } 
          case JsonEventType.openObject: 
            feedback.push(next.push({type: JsonHighEventType.openObject}))
            break
          case JsonEventType.openArray: 
            feedback.push(next.push({type: JsonHighEventType.openArray}))
            break
          case JsonEventType.closeObject: 
            feedback.push(next.push({type: JsonHighEventType.closeObject}))
            break
          case JsonEventType.closeArray: 
            feedback.push(next.push({type: JsonHighEventType.closeArray}))
            break
          case JsonEventType.closeTrue: 
            feedback.push(next.push({
              type: JsonHighEventType.value, 
              value: true,
            }))
            break
          case JsonEventType.closeFalse: 
            feedback.push(next.push({
              type: JsonHighEventType.value, 
              value: false,
            }))
            break
          case JsonEventType.closeNull: 
            feedback.push(next.push({
              type: JsonHighEventType.value, 
              value: null,
            }))
            break
          case JsonEventType.colon:
          case JsonEventType.comma:
          case JsonEventType.whitespace:
          case JsonEventType.openNull:
          case JsonEventType.openTrue:
          case JsonEventType.openFalse:
          case JsonEventType.codePoint:
            // ignore
            break
          default: throw Error(`unrecognized event ${type}`)
        }
        break
        case 'string': switch (type) {
          case JsonEventType.codePoint: {
            stringBuffer += String.fromCodePoint(event.codePoint)
            break
          } 
          case JsonEventType.escape: {
            mode = 'escape'
            break
          } 
          case JsonEventType.openHex: {
            hexBuf = []
            mode = 'hex'
            break
          } 
          case JsonEventType.closeString: {
            mode = 'top'
            feedback.push(next.push({
              type: JsonHighEventType.value,
              value: stringBuffer,
            }))
            break
          } 
          case JsonEventType.closeKey: {
            mode = 'top'
            feedback.push(next.push({
              type: JsonHighEventType.key,
              key: stringBuffer,
            }))
            break
          }
        }
        break
        case 'escape': if (type === JsonEventType.codePoint) {
          const {codePoint} = event
          if (codePoint === _n_) stringBuffer += '\n'
          else if (codePoint === _t_) stringBuffer += '\t'
          else if (codePoint === _r_) stringBuffer += '\r'
          else if (codePoint === _b_) stringBuffer += '\b'
          else if (codePoint === _f_) stringBuffer += '\f'
          else {
            // " or \\ or /
            stringBuffer += String.fromCharCode(codePoint)
          }
          mode = 'string'
        }
        break
        case 'hex': if (type === JsonEventType.codePoint) {
          hexBuf.push(event.codePoint)
        } else if (type === JsonEventType.closeHex) {
          hexBuf.push(event.codePoint)
          stringBuffer += String.fromCharCode(Number.parseInt(String.fromCharCode(...hexBuf), 16))
          mode = 'string'
        }
        break
        case 'number': if (type === JsonEventType.codePoint) {
          numberBuffer += String.fromCharCode(event.codePoint)
        } else if (type === JsonEventType.closeNumber) {
          mode = 'top'
          feedbackQueue.push(next.push({
            type: JsonHighEventType.value,
            value: Number.parseFloat(numberBuffer),
          }))
          break
        }
        break
        default: throw Error('unknown mode')
      }

      return feedback
    },
    end: () => {
      const feedback = []
      if (feedbackQueue.length > 0) feedback.push(feedbackQueue.pop())
      feedback.push(next.end())
      return feedback
    },
  }
  return self
}