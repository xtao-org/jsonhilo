import {JsonLowToHigh} from './JsonLowToHigh.js'
import {JsonLow, JsonFeedbackType} from './JsonLow.js'
import {PosInfoAdapter} from './PosInfoAdapter.js'

/**
 * 
 * @param {import('./JsonHigh.js').JsonHighHandlers<Feedback, End>} next
 */
export const JsonHigh = (next) => {
  const jsonLowToHighStream = JsonLowToHigh(next)
  const stream = PosInfoAdapter(JsonLow(jsonLowToHighStream))

  const self = {
    chunk(chunk) {
      for (const c of chunk) {
        const feedback = stream.codePoint(c.codePointAt(0))
        const {closeNumberFeedback} = jsonLowToHighStream
        if (closeNumberFeedback !== undefined) {
          jsonLowToHighStream.closeNumberFeedback = undefined
          // note: this repetition...
          if (closeNumberFeedback.type === JsonFeedbackType.error) {
            throw Error(JSON.stringify(closeNumberFeedback, null, 2))
          }
        }
        if (feedback === undefined) continue
        if ('feedbacks' in feedback) {
          for (const f of feedback.feedbacks) {
            if (f === undefined) continue
            // ...is not ideal, but...
            if (f.type === JsonFeedbackType.error) {
              throw Error(JSON.stringify(f, null, 2))
            }
          }
          // ...no better idea for now...
        } else if (feedback.type === JsonFeedbackType.error) {
          throw Error(JSON.stringify(feedback, null, 2))
        }
      }
      return self
    },
    end() {
      return stream.end()
    },
    depth() {
      return stream.depth()
    },
    state() {
      return stream.state()
    }
  }
  return self
}