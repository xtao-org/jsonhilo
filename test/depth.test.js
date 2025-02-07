import {JsonLow, JsonHigh} from '../mod.js'

import test from 'node:test'

// ?todo: test JsonLow
// todo: figure out ergonomy considering when depth is updated

// test case and functionality requested in https://github.com/xtao-org/jsonhilo/issues/8
test('get current depth', async () => {
  const handlers = {
    openObject() {
      console.log('openObject', stream.depth())
    },
    closeObject() {
      console.log('closeObject', stream.depth())
    }
  }
  const stream = JsonHigh(handlers)
  stream.chunk('{"0": {"1": {"2": 2}}}')
  
})