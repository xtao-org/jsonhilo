import {JsonLowToHigh} from './JsonLowToHigh.js'
import {JsonLow, JsonFeedbackType} from './JsonLow.js'
import {PosInfoAdapter} from './PosInfoAdapter.js'

export const JsonHigh = (next) => {
  const stream = PosInfoAdapter(JsonLow(JsonLowToHigh(next)))

  const self = {
    chunk(chunk) {
      for (const c of chunk) {
        const feedback = [stream.codePoint(c.codePointAt(0))].flat()
        for (const f of feedback) {
          if (f.type === JsonFeedbackType.error) throw Error(JSON.stringify(f))
        }
      }
      return self
    },
    end() {
      return stream.end()
    },
    state() {
      return stream.state()
    }
  }
  return self
}