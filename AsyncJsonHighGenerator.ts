import { JsonHigh } from "./JsonHigh.js"
import type { JsonHighHandlers, JsonHighOptions } from "./JsonHigh.d.ts"
import type { JsonStandardEnd, JsonStandardFeedback } from "./JsonLow.d.ts"

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
const openArrayToken   = Object.freeze({ type: 'openArray' })
const closeArrayToken  = Object.freeze({ type: 'closeArray' })
const openObjectToken  = Object.freeze({ type: 'openObject' })
const closeObjectToken = Object.freeze({ type: 'closeObject' })
const openKeyToken     = Object.freeze({ type: 'openKey' })
const openStringToken  = Object.freeze({ type: 'openString' })
const openNumberToken  = Object.freeze({ type: 'openNumber' })
const closeKeyToken    = Object.freeze({ type: 'closeKey' })
const closeStringToken = Object.freeze({ type: 'closeString' })
const endToken         = Object.freeze({ type: 'end' })

// note: these are constant, so can reuse to avoid garbage as well
const trueToken  = Object.freeze({ type: 'value', value: true })
const falseToken = Object.freeze({ type: 'value', value: false })
const nullToken  = Object.freeze({ type: 'value', value: null })

const allTokenTypes: Array<JsonHighToken['type']> = [
  "openArray", "closeArray", "openObject", "closeObject", "openKey",
  "openString", "openNumber", "closeKey", "closeString", "bufferKey",
  "bufferString", "bufferNumber", "key", "value", "end"
]

/**
 * 
 * @param chunks we accept {@link Iterable}s here because we can, but using them is not recommended -- they are effectively converted to async, so there is a performance hit; however as of 2025-08-24 we have no sync version of this interface (@todo), so the only substitute is to use the event-based interface of {@link JsonHigh} directly.
 */
export const AsyncJsonHighGenerator = (
  chunks: AsyncIterable<string> | Iterable<string>,
  options: JsonHighOptions & {tokenTypes?: Array<JsonHighToken['type']>} = {},
): AsyncGenerator<JsonHighToken> => {
  const q: JsonHighToken[] = []
  const {tokenTypes = allTokenTypes, ...restOptions} = options
  const ts = new Set(tokenTypes)

  // todo: tidy up those type definitions; alias JsonHighHanlders
  const hs: JsonHighHandlers<
    void | JsonStandardFeedback,
    void | JsonStandardEnd
  > = restOptions
  if (ts.has('openArray'))   hs.openArray   = () => { q.push(openArrayToken) }
  if (ts.has('closeArray'))  hs.closeArray  = () => { q.push(closeArrayToken) }
  if (ts.has('openObject'))  hs.openObject  = () => { q.push(openObjectToken) }
  if (ts.has('closeObject')) hs.closeObject = () => { q.push(closeObjectToken) }
  if (ts.has('openKey'))     hs.openKey     = () => { q.push(openKeyToken) }
  if (ts.has('openString'))  hs.openString  = () => { q.push(openStringToken) }
  if (ts.has('openNumber'))  hs.openNumber  = () => { q.push(openNumberToken) }
  if (ts.has('closeKey'))    hs.closeKey    = () => { q.push(closeKeyToken) }
  if (ts.has('closeString')) hs.closeString = () => { q.push(closeStringToken) }
  if (ts.has('end'))         hs.end         = () => { q.push(endToken) }

  if (ts.has('key'))   hs.key   = (key)   => { q.push({ type: 'key', key }) }
  if (ts.has('value')) hs.value = (value) => {
    if      (value === true)  q.push(trueToken)
    else if (value === false) q.push(falseToken)
    else if (value === null)  q.push(nullToken)
    else                      q.push({ type: 'value', value })
  }

  if (ts.has('bufferKey'))    hs.bufferKey    = (buffer: string) => {
    q.push({ type: 'bufferKey', buffer })
  }
  if (ts.has('bufferString')) hs.bufferString = (buffer: string) => {
    q.push({ type: 'bufferString', buffer })
  }
  if (ts.has('bufferNumber')) hs.bufferNumber = (buffer: string) => {
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

