import {JsonHigh} from '../mod.js'

import test from 'node:test'
import assert, { AssertionError } from "node:assert"

// test case for functionality requested in https://github.com/xtao-org/jsonhilo/issues/10
test('max buffer length', async () => {
  const called = []
  const handlers = {
    maxBufferLength: 4,
    value(v) {
      throw AssertionError(`Unexpected value: ${v}`)
    },
    key(k) {
      throw AssertionError(`Unexpected key: ${k}`)
    },
    buffer(p) {
      called.push(p)
    },
    openKey() {
      called.push('openKey')
    },
    openString() {
      called.push('openString')
    },
    closeKey() {
      called.push('closeKey')
    },
    closeString() {
      called.push('closeString')
    },
  }
  const stream = JsonHigh(handlers)
  stream.chunk(`
    {"thequickbrownfox": "jumpsoverthelazydog"}
  `)

  assert.deepEqual(called, [
    'openKey',
    'theq',
    'uick',
    'brow',
    'nfox',
    'closeKey',
    'openString',
    'jump',
    'sove',
    'rthe',
    'lazy',
    'dog',
    'closeString',
  ])
})
