import {CodePoint} from './JsonLow.js'

const {_t_, _n_, _b_, _r_, _f_} = CodePoint

export const JsonLowToHigh = (next) => {
  let mode = 'top'
  let stringBuffer = ''
  let numberBuffer = ''
  let hexBuf = []
  const feedbackQueue = []

  const valFeedback = (val) => {
    return feedbackQueue.length > 0? [feedbackQueue.pop(), val]: [val]
  }

  const openStringKey = () => {
    stringBuffer = ''
    mode = 'string'
    return feedbackQueue.length > 0? [feedbackQueue.pop()]: []
  }

  const self = {
    openString: openStringKey,
    openKey: openStringKey,
    openNumber: (codePoint) => {
      numberBuffer = String.fromCharCode(codePoint)
      mode = 'number'
      return feedbackQueue.length > 0? [feedbackQueue.pop()]: []
    },
    openObject: (_, depth) => {
      return valFeedback(next.openObject?.(depth))
    },
    openArray: (_, depth) => {
      return valFeedback(next.openArray?.(depth))
    },
    closeObject: (_, depth) => {
      return valFeedback(next.closeObject?.(depth))
    },
    closeArray: (_, depth) => {
      return valFeedback(next.closeArray?.(depth))
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
        stringBuffer += String.fromCodePoint(codePoint)
      } else if (mode === 'escape') {
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
      } else if (mode === 'hex') {
        hexBuf.push(codePoint)
      } else if (mode === 'number') {
        numberBuffer += String.fromCharCode(codePoint)
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
      return valFeedback(next.value?.(stringBuffer))
    },
    closeKey: () => {
      mode = 'top'
      return valFeedback(next.key?.(stringBuffer))
    },
    closeHex: (codePoint) => {
      hexBuf.push(codePoint)
      stringBuffer += String.fromCharCode(Number.parseInt(String.fromCharCode(...hexBuf), 16))
      mode = 'string'
      return feedbackQueue.length > 0? [feedbackQueue.pop()]: []
    },
    closeNumber: () => {
      mode = 'top'
      feedbackQueue.push(next.value?.(
        Number.parseFloat(numberBuffer),
      ))
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