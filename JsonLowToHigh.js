import {CodePoint, error} from './JsonLow.js'

const {_t_, _n_, _b_, _r_, _f_} = CodePoint

// todo: add types for the new handlers
export const JsonLowToHigh = (next) => {
  const {
    // todo: maybe more specific name?
    maxBufferLength = Infinity,
    // todo: naming
    // todo: document
    maxNumberLength = 8192,
    parseNumbers = true,
  } = next

  let mode = 'top'
  let stringKind = 'string'
  let stringBuffer = ''
  // note: in codepoints, so counting manually for performance
  let stringBufferLength = 0
  let numberBuffer = ''
  let hexBuffer = []

  const self = {
    // note: for the closeNumber edge case we store feedback here 
    //       and check inside JsonHigh
    closeNumberFeedback: undefined,
    openString: () => {
      stringBuffer = ''
      stringBufferLength = 0
      mode = 'string'
      stringKind = 'string'
      return next.openString?.()
    },
    openKey: () => {
      stringBuffer = ''
      stringBufferLength = 0
      mode = 'string'
      stringKind = 'key'
      return next.openKey?.()
    },
    openNumber: (codePoint) => {
      numberBuffer = String.fromCharCode(codePoint)
      mode = 'number'
      return next.openNumber?.()
    },
    openObject: () => {
      return next.openObject?.()
    },
    openArray: () => {
      return next.openArray?.()
    },
    closeObject: () => {
      return next.closeObject?.()
    },
    closeArray: () => {
      return next.closeArray?.()
    },
    closeTrue: () => {
      return next.value?.(true)
    },
    closeFalse: () => {
      return next.value?.(false)
    },
    closeNull: () => {
      return next.value?.(null)
    },
    codePoint: (codePoint) => {
      if (mode === 'string') {
        const c = String.fromCodePoint(codePoint)
        if (stringBufferLength === maxBufferLength) {
          const buf = stringBuffer
          stringBuffer = c
          stringBufferLength = 1
          return stringKind === 'string'?
            next.stringBuffer?.(buf):
            next.keyBuffer?.(buf)
        }
        stringBuffer += c
        stringBufferLength += 1
      } else if (mode === 'escape') {
        let c
        if      (codePoint === _n_) c = '\n'
        else if (codePoint === _t_) c = '\t'
        else if (codePoint === _r_) c = '\r'
        else if (codePoint === _b_) c = '\b'
        else if (codePoint === _f_) c = '\f'
        else {
          // " or \\ or /
          c = String.fromCharCode(codePoint)
        }
        mode = 'string'

        if (stringBufferLength === maxBufferLength) {
          const buf = stringBuffer
          stringBuffer = c
          stringBufferLength = 1
          return stringKind === 'string'?
            next.stringBuffer?.(buf):
            next.keyBuffer?.(buf)
        }
        stringBuffer += c
        stringBufferLength += 1
      } else if (mode === 'hex') {
        hexBuffer.push(codePoint)
      } else if (mode === 'number') {
        if (numberBuffer.length === maxNumberLength) return error(`Number length over the limit of ${maxNumberLength}! Try increasing the limit.`)
        numberBuffer += String.fromCharCode(codePoint)
      }
    },
    escape: () => {
      mode = 'escape'
    },
    openHex: () => {
      hexBuffer = []
      mode = 'hex'
    },
    closeString: () => {
      mode = 'top'
      if (maxBufferLength === Infinity) {
        return next.value?.(stringBuffer)
      } else {
        // note: wrapping feedbacks in an object to work around PosInfoAdapter
        return {feedbacks: [
          next.stringBuffer?.(stringBuffer),
          next.closeString?.(),
        ]}
      }
    },
    closeKey: () => {
      mode = 'top'
      if (maxBufferLength === Infinity) {
        return next.key?.(stringBuffer)
      } else {
        // note: wrapping feedbacks in an object to work around PosInfoAdapter
        return {feedbacks: [
          next.keyBuffer?.(stringBuffer),
          next.closeKey?.(),
        ]}
      }
    },
    closeHex: (codePoint) => {
      hexBuffer.push(codePoint)
      mode = 'string'

      const c = String.fromCharCode(Number.parseInt(String.fromCharCode(...hexBuffer), 16))
      if (stringBufferLength === maxBufferLength) {
        const buf = stringBuffer
        stringBuffer = c
        stringBufferLength = 1
        return stringKind === 'string'?
          next.stringBuffer?.(buf):
          next.keyBuffer?.(buf)
      }
      stringBuffer += c
      stringBufferLength += 1
    },
    closeNumber: () => {
      mode = 'top'
      if (parseNumbers) {
        self.closeNumberFeedback = next.value?.(
          Number.parseFloat(numberBuffer),
        )
      } else {
        self.closeNumberFeedback = next.numberBuffer?.(numberBuffer)
      }
    },
    end: () => {
      return next.end?.()
    },
  }
  return self
}