import {JsonHigh} from '../mod.js'

import test from 'node:test'
import assert from "node:assert"

// test case for functionality requested in https://github.com/xtao-org/jsonhilo/issues/8
test('get current depth', async () => {
  let topLevelObjectCount = 0
  const handlers = {
    closeObject() {
      const depth = stream.depth()
      if (depth === 0) topLevelObjectCount += 1
    }
  }
  const stream = JsonHigh(handlers)
  stream.chunk(`
    { "0": [ { "1": [2] } ] }
    {}
    [5, 5, []]
    { "0": {} }
  `)

  assert.equal(topLevelObjectCount, 3)
})
