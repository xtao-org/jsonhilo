import {CodePoint, error} from './JsonLow.js'

const {_t_, _n_, _b_, _r_, _f_} = CodePoint

/**
 * 
 * @param {import('./JsonHigh.js').JsonHighHandlers<Feedback, End>} next
 */
export const JsonLowToHigh = (next) => {
  const {
    maxStringBufferLength = Infinity,
    maxNumberLength = 8192,
    parseNumbers = true,
    bufferOnChunk = false,
  } = next

  if (maxStringBufferLength < 1) throw Error(`maxStringBufferLength must be at least 1!`)
  if (maxNumberLength < 1) throw Error(`maxNumberLength must be at least 1!`)

  const bufferingEnabled = bufferOnChunk || maxStringBufferLength < Infinity

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
    _closeNumberFeedback: undefined,
    _flushStringBuffer: () => {
      if (bufferOnChunk && stringBufferLength > 0) {
        const buf = stringBuffer
        stringBuffer = ''
        stringBufferLength = 0
        return stringKind === 'string'?
          next.bufferString?.(buf):
          next.bufferKey?.(buf)
      }
    },
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
        if (stringBufferLength === maxStringBufferLength) {
          const buf = stringBuffer
          stringBuffer = c
          stringBufferLength = 1
          return stringKind === 'string'?
            next.bufferString?.(buf):
            next.bufferKey?.(buf)
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

        if (stringBufferLength === maxStringBufferLength) {
          const buf = stringBuffer
          stringBuffer = c
          stringBufferLength = 1
          return stringKind === 'string'?
            next.bufferString?.(buf):
            next.bufferKey?.(buf)
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
      if (bufferingEnabled == false) {
        return next.value?.(stringBuffer)
      } else {
        // note: to prevent double-flushing
        stringBufferLength = 0
        // note: wrapping feedbacks in an object to work around PosInfoAdapter
        return {feedbacks: [
          next.bufferString?.(stringBuffer),
          next.closeString?.(),
        ]}
      }
    },
    closeKey: () => {
      mode = 'top'
      if (bufferingEnabled === false) {
        return next.key?.(stringBuffer)
      } else {
        // note: to prevent double-flushing
        stringBufferLength = 0
        // note: wrapping feedbacks in an object to work around PosInfoAdapter
        return {feedbacks: [
          next.bufferKey?.(stringBuffer),
          next.closeKey?.(),
        ]}
      }
    },
    closeHex: (codePoint) => {
      hexBuffer.push(codePoint)
      mode = 'string'

      // note: this is correct code-unit-wise; fromCharCode operates on code units
      const c = String.fromCharCode(Number.parseInt(String.fromCharCode(...hexBuffer), 16))
      if (stringBufferLength === maxStringBufferLength) {
        const buf = stringBuffer
        stringBuffer = c
        stringBufferLength = 1
        return stringKind === 'string'?
          next.bufferString?.(buf):
          next.bufferKey?.(buf)
      }
      stringBuffer += c
      stringBufferLength += 1
    },
    closeNumber: () => {
      mode = 'top'
      if (parseNumbers) {
        self._closeNumberFeedback = next.value?.(
          Number.parseFloat(numberBuffer),
        )
      } else {
        self._closeNumberFeedback = next.bufferNumber?.(numberBuffer)
      }
    },
    end: () => {
      // avoid memory leaks
      stringBuffer = ''
      stringBufferLength = 0
      numberBuffer = ''
      return next.end?.()
    },
  }
  return self
}