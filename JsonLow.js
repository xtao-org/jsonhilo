export const CodePoint = {
  _0_: '0'.codePointAt(0),
  _1_: '1'.codePointAt(0),
  _9_: '9'.codePointAt(0),
  _a_: 'a'.codePointAt(0),
  _f_: 'f'.codePointAt(0),
  _A_: 'A'.codePointAt(0),
  _F_: 'F'.codePointAt(0),
  _openCurly_: '{'.codePointAt(0),
  _openSquare_: '['.codePointAt(0),
  _closeCurly_: '}'.codePointAt(0),
  _closeSquare_: ']'.codePointAt(0),
  _quoteMark_: '"'.codePointAt(0),
  _plus_: '+'.codePointAt(0),
  _minus_: '-'.codePointAt(0),
  _space_: ' '.codePointAt(0),
  _newline_: '\n'.codePointAt(0),
  _tab_: '\t'.codePointAt(0),
  _return_: '\r'.codePointAt(0),
  _backslash_: '\\'.codePointAt(0),
  _slash_: '/'.codePointAt(0),
  _comma_: ','.codePointAt(0),
  _colon_: ':'.codePointAt(0),
  _t_: 't'.codePointAt(0),
  _n_: 'n'.codePointAt(0),
  _b_: 'b'.codePointAt(0),
  _r_: 'r'.codePointAt(0),
  _u_: 'u'.codePointAt(0),
  _dot_: '.'.codePointAt(0),
  _e_: 'e'.codePointAt(0),
  _E_: 'E'.codePointAt(0),
  _l_: 'l'.codePointAt(0),
  _s_: 's'.codePointAt(0),
}
const {
  _0_, _1_, _9_, _A_, _E_, _F_, _a_, _b_, _backslash_, _closeCurly_,
  _closeSquare_, _colon_, _comma_, _dot_, _e_, _f_, _l_, _minus_, 
  _n_, _newline_, _openCurly_, _openSquare_, _plus_, _quoteMark_, 
  _r_, _return_, _s_, _slash_, _space_, _t_, _tab_, _u_,
} = CodePoint

export const JsonFeedbackType = {
  error: 'JsonFeedbackType.error',
}
export const JsonErrorType = {
  unexpected: 'JsonErrorType.unexpected',
  unexpectedEnd: 'JsonErrorType.unexpectedEnd',
}
export const error = (message) => {
  return {
    type: JsonFeedbackType.error, 
    message,
  }
}
export const unexpected = (code, context, expected) => {
  return {
    type: JsonFeedbackType.error,
    errorType: JsonErrorType.unexpected,
    codePoint: code,
    context,
    expected,
  }
}
export const unexpectedEnd = (context, expected) => {
  return {
    type: JsonFeedbackType.error,
    errorType: JsonErrorType.unexpectedEnd,
    context,
    expected,
  }
}
export const isZeroNine = (code) => code >= _0_ && code <= _9_
export const isOneNine = (code) => code >= _1_ && code <= _9_
export const isWhitespace = (code) => 
  code === _space_ || code === _newline_ ||
  code === _tab_ || code === _return_
export const JsonLow = (next, initialState = {}) => {
  let mode = initialState.mode ?? 'Mode._value'
  let parents = initialState.parents ?? ['Parent.top']
  let hexIndex = initialState.hexIndex ?? 0
  let maxDepth = initialState.maxDepth ?? 65536
  let isKey = initialState.isKey ?? false

  const fraction = (code) => {
    if (code === _dot_) {
      mode = 'Mode.dot_'
      return next.codePoint?.(code)
    }
    return exponent(code)
  }
  const exponent = (code) => {
    if (code === _e_ || code === _E_) {
      mode = 'Mode.exponent_'
      return next.codePoint?.(code)
    }
    return number(code)
  }
  /** 
   * numbers are delimited by any token that comes after:
   *    whitespace, comma, parent close
   * so we have to emit an event and handle the token 
   */
  const number = (code) => {
    mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
    next.closeNumber?.()
    return self.codePoint(code)
  }
  
  const maxDepthExceeded = () => error(
    `Invalid parser state! Max depth of ${maxDepth} exceeded!`
  )

  const closeParent = (code) => {
    const parent = parents.pop()
    if (code === _closeCurly_) {
      if (parent === 'Parent.object') {
        mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
        return next.closeObject?.(code)
      }
    } 
    if (code === _closeSquare_) {
      if (parent === 'Parent.array') {
        mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
        return next.closeArray?.(code)
      }
    }
    return unexpected(code, `in ${parentToString(parent)}`)
  }

  const self = {
    codePoint: (code) => {
      switch (mode) {
        case 'Mode._value': switch (code) {
          case _openCurly_: {
            if (parents.length >= maxDepth) return maxDepthExceeded()
            parents.push('Parent.object')
            isKey = true
            mode = 'Mode._key'
            return next.openObject?.(code)
          }
          case _openSquare_: {
            if (parents.length >= maxDepth) return maxDepthExceeded()
            parents.push('Parent.array')
            mode = 'Mode._value'
            return next.openArray?.(code)
          }
          case _quoteMark_: 
            mode = 'Mode.string_'
            return next.openString?.(code)
          case _t_: 
            mode = 'Mode.t_rue'
            return next.openTrue?.(code)
          case _f_: 
            mode = 'Mode.f_alse'
            return next.openFalse?.(code)
          case _n_: 
            mode = 'Mode.n_ull'
            return next.openNull?.(code)
          case _minus_: 
            mode = 'Mode.minus_'
            return next.openNumber?.(code)
          case _0_: 
            mode = 'Mode.zero_'
            return next.openNumber?.(code)
          default:
            if (isOneNine(code)) {
              mode = 'Mode.onenine_'
              return next.openNumber?.(code)
            }
            if (isWhitespace(code)) return next.whitespace?.(code)
            return closeParent(code)
        }
        case 'Mode.value_':
          if (code === _comma_) {
            const parent = parents[parents.length - 1]
            if (parent === 'Parent.object') {
              isKey = true
              mode = 'Mode._key'
              return next.comma?.(code)
            } 
            if (parent === 'Parent.array') {
              mode = 'Mode._value'
              return next.comma?.(code)
            }
            return error(`Invalid parser state! Unexpected parent ${parent}.`)
          }
          if (isWhitespace(code)) return next.whitespace?.(code)
          return closeParent(code)
        case 'Mode._key':
          if (code === _quoteMark_) {
            mode = 'Mode.string_'
            return next.openKey?.(code)
          }
          if (code === _closeCurly_) {
            parents.pop()
            isKey = false
            mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
            return next.closeObject?.(code)
          } 
          if (isWhitespace(code)) return next.whitespace?.(code)
          return unexpected(code, 'in an object', ['"', '}', 'whitespace'])
        case 'Mode.key_':
          if (code === _colon_) {
            isKey = false
            mode = 'Mode._value'
            return next.colon?.(code)
          } 
          if (isWhitespace(code)) return next.whitespace?.(code)
          return unexpected(code, 'after key', [':', 'whitespace'])
        case 'Mode.string_':
          if (code === _quoteMark_) {
            if (isKey) {
              mode = 'Mode.key_'
              return next.closeKey?.(code)
            }
            mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
            return next.closeString?.(code)
          } 
          if (code === _backslash_) {
            mode = 'Mode.escape_'
            return next.escape?.(code)
          }
          if (code >= 0x0020 && code <= 0x10ffff) return next.codePoint?.(code)
          return unexpected(code, 'in a string', ['"', '\\', 'a code point 0x0020 thru 0x10ffff'])
        case 'Mode.escape_':
          if (
            code === _quoteMark_ || code === _n_ ||
            code === _backslash_ || code === _t_ ||
            code === _slash_ || code === _b_ ||
            code === _f_ || code === _r_
          ) {
            mode = 'Mode.string_'
            return next.codePoint?.(code)
          }
          if (code === _u_) {
            mode = 'Mode.hex_'
            return next.openHex?.(code)
          }
          return unexpected(code, 'after escape', ['"', 'n', '\\', 't', '/', 'b', 'f', 'r', 'u'])
        case 'Mode.hex_':
          if (
            (code >= _0_ && code <= _9_) ||
            (code >= _a_ && code <= _f_) ||
            (code >= _A_ && code <= _F_)
          ) {
            if (hexIndex < 3) {
              hexIndex += 1
              return next.codePoint?.(code)
            }
            hexIndex = 0
            mode = 'Mode.string_'
            return next.closeHex?.(code)
          }
          return unexpected(code, `at index ${hexIndex} of a hexadecimal escape sequence`, [['a', 'f'], ['A', 'F'], ['0', '9']])
        case 'Mode.minus_':
          if (code === _0_) {
            mode = 'Mode.zero_'
            return next.codePoint?.(code)
          }
          if (isOneNine(code)) {
            mode = 'Mode.onenine_'
            return next.codePoint?.(code)
          }
          return unexpected(code, `after '-'`, [['0', '9']])
        case 'Mode.zero_': return fraction(code)
        case 'Mode.onenine_':
          if (isZeroNine(code)) {
            mode = 'Mode.onenineDigit_'
            return next.codePoint?.(code)
          }
          return fraction(code)
        case 'Mode.dot_':
          if (isZeroNine(code)) {
            mode = 'Mode.digitDotDigit_'
            return next.codePoint?.(code)
          }
          return unexpected(code, `after '.'`, [['0', '9']])
        case 'Mode.exponent_':
          if (code === _plus_ || code === _minus_) {
            mode = 'Mode.exponentSign_'
            return next.codePoint?.(code)
          }
          if (isZeroNine(code)) {
            mode = 'Mode.exponentSignDigit_'
            return next.codePoint?.(code)
          }
          return unexpected(code, `after exponent`, ['+', '-', ['0', '9']])
        case 'Mode.exponentSign_':
          if (isZeroNine(code)) {
            mode = 'Mode.exponentSignDigit_'
            return next.codePoint?.(code)
          }
          return unexpected(code, `after exponent sign`, [['0', '9']])
        case 'Mode.onenineDigit_':
          if (isZeroNine(code)) return next.codePoint?.(code)
          return fraction(code) 
        case 'Mode.digitDotDigit_':
          if (isZeroNine(code)) return next.codePoint?.(code)
          return exponent(code)
        case 'Mode.exponentSignDigit_':
          if (isZeroNine(code)) return next.codePoint?.(code)
          return number(code)
        case 'Mode.t_rue':
          if (code === _r_) {
            mode = 'Mode.tr_ue'
            return next.codePoint?.(code)
          }
          return unexpected(code, `at the second position in true`, ['r'])
        case 'Mode.tr_ue':
          if (code === _u_) {
            mode = 'Mode.tru_e'
            return next.codePoint?.(code)
          }
          return unexpected(code, `at the third position in true`, ['u'])
        case 'Mode.tru_e':
          if (code === _e_) {
            mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
            return next.closeTrue?.(code)
          }
          return unexpected(code, `at the fourth position in true`, ['e'])
        case 'Mode.f_alse':
          if (code === _a_) {
            mode = 'Mode.fa_lse'
            return next.codePoint?.(code)
          }
          return unexpected(code, `at the second position in false`, ['a'])
        case 'Mode.fa_lse':
          if (code === _l_) {
            mode = 'Mode.fal_se'
            return next.codePoint?.(code)
          }
          return unexpected(code, `at the third position in false`, ['l'])
        case 'Mode.fal_se':
          if (code === _s_) {
            mode = 'Mode.fals_e'
            return next.codePoint?.(code)
          }
          return unexpected(code, `at the fourth position in false`, ['s'])
        case 'Mode.fals_e':
          if (code === _e_) {
            mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
            return next.closeFalse?.(code)
          }
          return unexpected(code, `at the fifth position in false`, ['e'])
        case 'Mode.n_ull':
          if (code === _u_) {
            mode = 'Mode.nu_ll'
            return next.codePoint?.(code)
          }
          return unexpected(code, `at the second position in null`, ['u'])
        case 'Mode.nu_ll':
          if (code === _l_) {
            mode = 'Mode.nul_l'
            return next.codePoint?.(code)
          }
          return unexpected(code, `at the third position in null`, ['l'])
        case 'Mode.nul_l':
          if (code === _l_) {
            mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
            return next.closeNull?.(code)
          }
          return unexpected(code, `at the fourth position in null`, ['l'])
        default: return error(`Invalid parser mode: ${mode}`)
      }
    },
    end: () => {
      if (isKey) return unexpectedEnd(`a key/object left unclosed!`)

      const parent = parents[parents.length - 1]
      if (parent !== 'Parent.top') return unexpectedEnd(
        `${parentToString(parent)} left unclosed!`
      )

      switch (mode) {
        case 'Mode._value': return next.end?.()
        case 'Mode.key_': return error('a key/object left unclosed!')
        case 'Mode._key': return unexpectedEnd('an object left unclosed!')
        case 'Mode.exponentSignDigit_':
        case 'Mode.onenine_':
        case 'Mode.onenineDigit_':
        case 'Mode.digitDotDigit_':
        case 'Mode.zero_':
          mode = parents[parents.length - 1] === 'Parent.top'? 'Mode._value': 'Mode.value_'
          next.closeNumber?.()
          return next.end?.()
        case 'Mode.minus_':
        case 'Mode.dot_': 
        case 'Mode.exponent_':
        case 'Mode.exponentSign_':
          return unexpectedEnd(`incomplete number!`)
        case 'Mode.hex_': return unexpectedEnd('after hexadecimal escape in string!')
        case 'Mode.escape_': return unexpectedEnd('after escape in string!')
        case 'Mode.string_': return unexpectedEnd('a string left unclosed!')
        case 'Mode.t_rue': return unexpectedEnd(`before the second position in true!`, ['r'])
        case 'Mode.tr_ue': return unexpectedEnd(`before the third position in true!`, ['u'])
        case 'Mode.tru_e': return unexpectedEnd(`before the fourth position in true!`, ['e'])
        case 'Mode.f_alse': return unexpectedEnd(`before the second position in false!`, ['a'])
        case 'Mode.fa_lse': return unexpectedEnd(`before the third position in false!`, ['l'])
        case 'Mode.fal_se': return unexpectedEnd(`before the fourth position in false!`, ['s'])
        case 'Mode.fals_e': return unexpectedEnd(`before the fifth position in false!`, ['e'])
        case 'Mode.n_ull': return unexpectedEnd(`before the second position in null!`, ['u'])
        case 'Mode.nu_ll': return unexpectedEnd(`before the third position in null!`, ['l'])
        case 'Mode.nul_l': return unexpectedEnd(`before the fourth position in null!`, ['l'])
        default: return unexpectedEnd()
      }
    },
    state: () => {
      const downstream = next.state?.()
      return {mode, parents: [...parents], isKey, downstream}
    },
  }
  return self
}

const parentToString = (parent) => {
  switch (parent) {
    case 'Parent.array': return 'an array'
    case 'Parent.object': return 'an object'
    case 'Parent.top': return 'the top-level value'
  }
}