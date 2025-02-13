import {CodePoint} from './JsonLow.js'

const {_t_, _n_, _b_, _r_, _f_} = CodePoint

// todo: add types for the new handlers
// todo: should we emit .closeString() along with .value() and .closeKey() along with .key()?
// todo: should numbers buffer be separately controlled from the string/key buffer?
export const JsonLowToHigh = (next) => {
  let mode = 'top'
  let stringBuffer = ''
  // todo: could merge stringBuffer and numberBuffer into buffer
  let numberBuffer = ''
  let hexBuf = []
  const feedbackQueue = []

  const maxBufferLength = next.maxBufferLength ?? Infinity
  const parseNumbers = next.parseNumbers ?? true

  const valFeedback = (val) => {
    return feedbackQueue.length > 0? [feedbackQueue.pop(), val]: [val]
  }

  const self = {
    openString: () => {
      stringBuffer = ''
      mode = 'string'
      return valFeedback(next.openString?.())
    },
    openKey: () => {
      stringBuffer = ''
      mode = 'string'
      return valFeedback(next.openKey?.())
    },
    openNumber: (codePoint) => {
      numberBuffer = String.fromCharCode(codePoint)
      mode = 'number'
      return valFeedback(next.openNumber?.())
    },
    openObject: () => {
      return valFeedback(next.openObject?.())
    },
    openArray: () => {
      return valFeedback(next.openArray?.())
    },
    closeObject: () => {
      return valFeedback(next.closeObject?.())
    },
    closeArray: () => {
      return valFeedback(next.closeArray?.())
    },
    closeTrue: () => {
      return valFeedback(next.value?.(true))
    },
    closeFalse: () => {
      return valFeedback(next.value?.(false))
    },
    closeNull: () => {
      return valFeedback(next.value?.(null))
    },
    codePoint: (codePoint) => {
      if (mode === 'string') {
        const c = String.fromCodePoint(codePoint)
        if (stringBuffer.length === maxBufferLength) {
          const part = stringBuffer
          stringBuffer = c
          return valFeedback(next.buffer?.(part))
        }
        stringBuffer += c
      } else if (mode === 'escape') {
        let c
        if (codePoint === _n_) c = '\n'
        else if (codePoint === _t_) c = '\t'
        else if (codePoint === _r_) c = '\r'
        else if (codePoint === _b_) c = '\b'
        else if (codePoint === _f_) c = '\f'
        else {
          // " or \\ or /
          c = String.fromCharCode(codePoint)
        }
        mode = 'string'

        if (stringBuffer.length === maxBufferLength) {
          const part = stringBuffer
          stringBuffer = c
          return valFeedback(next.buffer?.(part))
        }
        stringBuffer += c
      } else if (mode === 'hex') {
        hexBuf.push(codePoint)
      } else if (mode === 'number') {
        const c = String.fromCharCode(codePoint)
        if (parseNumbers === false && numberBuffer.length === maxBufferLength) {
          const part = numberBuffer
          numberBuffer = c
          // todo: numberPart?
          return valFeedback(next.buffer?.(part))
        }
        numberBuffer += c
      }
      return feedbackQueue.length > 0? [feedbackQueue.pop()]: []
    },
    escape: () => {
      mode = 'escape'
      return feedbackQueue.length > 0? [feedbackQueue.pop()]: []
    },
    openHex: () => {
      hexBuf = []
      mode = 'hex'
      return feedbackQueue.length > 0? [feedbackQueue.pop()]: []
    },
    closeString: () => {
      mode = 'top'
      if (maxBufferLength === Infinity) {
        return valFeedback(next.value?.(stringBuffer))
      } else {
        const ret = [
          next.buffer?.(stringBuffer),
          next.closeString?.(),
        ]
        if (feedbackQueue.length > 0) {
          ret.unshift(feedbackQueue.pop())
        }
        return ret
      }
    },
    closeKey: () => {
      mode = 'top'
      if (maxBufferLength === Infinity) {
        return valFeedback(next.key?.(stringBuffer))
      } else {
        const ret = [
          next.buffer?.(stringBuffer),
          next.closeKey?.(),
        ]
        if (feedbackQueue.length > 0) {
          ret.unshift(feedbackQueue.pop())
        }
        return ret
      }
    },
    closeHex: (codePoint) => {
      hexBuf.push(codePoint)
      mode = 'string'

      const c = String.fromCharCode(Number.parseInt(String.fromCharCode(...hexBuf), 16))
      if (stringBuffer.length === maxBufferLength) {
        const part = stringBuffer
        stringBuffer = c
        return valFeedback(next.buffer?.(part))
      }
      stringBuffer += c
      return feedbackQueue.length > 0? [feedbackQueue.pop()]: []
    },
    closeNumber: () => {
      mode = 'top'
      if (parseNumbers) {
        feedbackQueue.push(next.value?.(
          Number.parseFloat(numberBuffer),
        ))
      } else {
        feedbackQueue.push(
          // todo: numberPart?
          next.buffer?.(numberBuffer),
          next.closeNumber?.(),
        )
      }
      // todo: return undefined?
      return []
    },
    end: () => {
      const feedback = []
      if (feedbackQueue.length > 0) feedback.push(feedbackQueue.pop())
      feedback.push(next.end?.())
      return feedback
    },
  }
  return self
}