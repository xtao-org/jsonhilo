import {AsyncJsonHighGenerator} from '../AsyncJsonHighGenerator.js'

import test from 'node:test'
import assert from "node:assert"

test('async generator with buffering on chunk', async function() {
  const chunks = [
    `{`,
    `"coun`,
    `try":`,
    `"Japan",`,
    `"cap`,
    `ital"`,
    `:`,
    `"Tok`,
    `yo"`,
    `}`,
  ]

  const chunkGenerator = (async function* () {
    for await (const chunk of chunks) yield chunk
  })()

  const actual = []
  for await (const chunk of AsyncJsonHighGenerator(
    chunkGenerator, 
    { bufferOnChunk: true, subscriptions: ['bufferKey', 'closeKey'] },
  )) {
    actual.push(chunk)
  }
  assert.deepStrictEqual(actual, [
    {
      buffer: 'coun',
      type: 'bufferKey'
    },
    {
      buffer: 'try',
      type: 'bufferKey'
    },
    {
      type: 'closeKey'
    },
    {
      buffer: 'cap',
      type: 'bufferKey'
    },
    {
      buffer: 'ital',
      type: 'bufferKey'
    },
    {
      type: 'closeKey'
    }
  ])
})
