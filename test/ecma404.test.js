import { dirname, posix } from "https://deno.land/std@0.100.0/path/mod.ts";

import {JsonLow, JsonFeedbackType} from '../JsonLow.js'
import {Ecma404} from '../Ecma404.js'
import {PosInfoAdapter} from '../PosInfoAdapter.js'

const next = {}
const path = posix.fromFileUrl(`${dirname(import.meta.url)}/JSONTestSuite/test_parsing/`)

const level = Deno.args.length > 0? Deno.args[0]: 'info'

const debug = (...args) => {if (level === 'debug') console.debug(...args)} 

for (const dirEntry of Deno.readDirSync(path)) {
  const {name} = dirEntry
  Deno.test(name, () => {
    const str = Deno.readTextFileSync(path + '/' + name)
    const stream = PosInfoAdapter(JsonLow(Ecma404(next)))
    let failedAsExpected = false
    const codePoints = [...str].map(c => c.codePointAt(0))
    for (let i = 0; i < codePoints.length; ++i) {
      const ret = stream.push(codePoints[i])
      if (ret.type === JsonFeedbackType.error) {
        if (name.startsWith('y_')) {
          console.error(ret)
          throw Error(`Expected ${name} to pass`)
        } else if (name.startsWith('i_')) {
          // name.startsWith('i_') && !['i_string_UTF-16LE_with_BOM.json', 'i_string_utf16LE_no_BOM.json', 'i_string_utf16BE_no_BOM.json'].includes(name)
          failedAsExpected = true
          debug("could optionally succeed, but didn't")
          break
        } else {
          failedAsExpected = true
          debug('failed as expected', ret)
          break
        }
      }
    }
    if (failedAsExpected === false) {
      const ret = stream.end()
  
      if (ret.type === JsonFeedbackType.error) {
        if (name.startsWith('y_') || name.startsWith('i_') && !['i_string_UTF-16LE_with_BOM.json', 'i_string_utf16LE_no_BOM.json', 'i_string_utf16BE_no_BOM.json'].includes(name)) {
          console.error(ret)
          throw Error(`Expected ${name} to pass`)
        } else {
          debug('failed, as expected', ret)
        }
      } else if (name.startsWith('n_')) {
        console.error(ret)
        throw Error(`Expected ${name} to fail`)
      }
    }
  })
}
