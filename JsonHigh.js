import {JsonEventToJsonHighEvent, JsonHighEventType} from './JsonEventToJsonHighEvent.js'
import {JsonLow, JsonFeedbackType} from './JsonLow.js'
import {PosInfoAdapter} from './PosInfoAdapter.js'

export {JsonHighEventType}

export const JsonHigh = (push, end = () => {}) => {
  const stream = PosInfoAdapter(JsonLow(JsonEventToJsonHighEvent({push, end})))

  const self = {
    push(chunk) {
      for (const c of chunk) {
        for (const f of [stream.push(c.codePointAt(0))].flat()) {
          if (f.type === JsonFeedbackType.error) throw Error(JSON.stringify(f))
        }
      }
      return self
    },
    end() {
      return stream.end()
    }
  }
  return self
}