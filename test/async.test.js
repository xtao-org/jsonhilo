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
    { bufferOnChunk: true, tokenTypes: ['bufferString', 'closeString'] },
  )) {
    actual.push(chunk)
  }
  assert.deepStrictEqual(actual, [
    {
      buffer: 'Japan',
      type: 'bufferString'
    },
    { type: 'closeString' },
    {
      buffer: 'Tok',
      type: 'bufferString'
    },
    {
      buffer: 'yo',
      type: 'bufferString'
    },
    { type: 'closeString' },
  ])
})

test('async generator error', async function() {
  const chunks = [
    `{`,
    `"coun`,
    `try":`,
    `"Japan",`,
    `"cap`,
    `ital"`,
    `:`,
    `"Tok`,
    // note: forgotten closing "
    `yo`,
    `}`,
  ]

  await assert.rejects(async () => {
    for await (const chunk of AsyncJsonHighGenerator(
      chunks, 
      { bufferOnChunk: true, tokenTypes: [] },
    )) {
      // do nothing
    }
  }, /.*an object left unclosed!.*/)
})
