import { JsonHigh } from "./JsonHigh.js"
import type { JsonHighHandlers, JsonHighOptions } from "./JsonHigh.js"

export type JsonHighToken =
  | { type: 'openArray' }
  | { type: 'closeArray' }
  | { type: 'openObject' }
  | { type: 'closeObject' }
  | { type: 'openKey' }
  | { type: 'openString' }
  | { type: 'openNumber' }
  | { type: 'closeKey' }
  | { type: 'closeString' }
  | { type: 'end' }
  | { type: 'key',   key: string }
  | { type: 'value', value: string | number | null | boolean }
  | { type: 'bufferKey',    buffer: string }
  | { type: 'bufferString', buffer: string }
  | { type: 'bufferNumber', buffer: string }

// note: most tokens have no attributes;
//       no need to generate new objects each time for them
//       reusing the same objects avoids generating excess garbage
const openArrayToken = Object.freeze({ type: 'openArray' })
const closeArrayToken = Object.freeze({ type: 'closeArray' })
const openObjectToken = Object.freeze({ type: 'openObject' })
const closeObjectToken = Object.freeze({ type: 'closeObject' })
const openKeyToken = Object.freeze({ type: 'openKey' })
const openStringToken = Object.freeze({ type: 'openString' })
const openNumberToken = Object.freeze({ type: 'openNumber' })
const closeKeyToken = Object.freeze({ type: 'closeKey' })
const closeStringToken = Object.freeze({ type: 'closeString' })
const endToken = Object.freeze({ type: 'end' })

const allSubscriptions: Array<JsonHighToken['type']> = ["openArray", "closeArray", "openObject", "closeObject", "openKey", "openString", "openNumber", "closeKey", "closeString", "bufferKey", "bufferString", "bufferNumber", "key", "value", "end"]
export const AsyncJsonHighGenerator = (
  chunks: AsyncGenerator<string>, 
  // todo: maybe subscriptions should be called subscribeTo or events or sth
  options: JsonHighOptions & {subscriptions?: Array<JsonHighToken['type']>} = {},
): AsyncGenerator<JsonHighToken> => {
  const q: JsonHighToken[] = []
  const {subscriptions = allSubscriptions, ...rest} = options
  const ss = new Set(subscriptions)
  const hs: JsonHighHandlers<void, void> = {...rest}
  if (ss.has('openArray'))   hs.openArray   = () => q.push(openArrayToken)
  if (ss.has('closeArray'))  hs.closeArray  = () => q.push(closeArrayToken)
  if (ss.has('openObject'))  hs.openObject  = () => q.push(openObjectToken)
  if (ss.has('closeObject')) hs.closeObject = () => q.push(closeObjectToken)
  if (ss.has('openKey'))     hs.openKey     = () => q.push(openKeyToken)
  if (ss.has('openString'))  hs.openString  = () => q.push(openStringToken)
  if (ss.has('openNumber'))  hs.openNumber  = () => q.push(openNumberToken)
  if (ss.has('closeKey'))    hs.closeKey    = () => q.push(closeKeyToken)
  if (ss.has('closeString')) hs.closeString = () => q.push(closeStringToken)
  if (ss.has('end'))         hs.end         = () => q.push(endToken)

  if (ss.has('key'))   hs.key   = (key)   => q.push({ type: 'key', key })
  if (ss.has('value')) hs.value = (value) => q.push({ type: 'value', value })

  if (ss.has('bufferKey'))    hs.bufferKey    = (buffer: string) => {
    q.push({ type: 'bufferKey', buffer })
  }
  if (ss.has('bufferString')) hs.bufferString = (buffer: string) => {
    q.push({ type: 'bufferString', buffer })
  }
  if (ss.has('bufferNumber')) hs.bufferNumber = (buffer: string) => {
    q.push({ type: 'bufferNumber', buffer })
  }

  const jh = JsonHigh(hs)
  return (async function*() {
    for await (const v of chunks) {
      jh.chunk(v)
      while (q.length > 0) yield q.shift()!
    }
    jh.end()
    while (q.length > 0) yield q.shift()!
    return
  })()
}

