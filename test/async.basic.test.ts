import {AsyncJsonHighGenerator} from '../AsyncJsonHighGenerator.js'

import test from 'node:test'
import assert from "node:assert"

async function collect<T>(asyncIterable: AsyncIterable<T>): Promise<T[]> {
  const results: T[] = []
  for await (const item of asyncIterable) {
    results.push(item)
  }
  return results
}

test('parse empty object', async () => {
  const input = async function*() { yield '{}' }()
  const tokens = await collect(AsyncJsonHighGenerator(input))
  assert.deepStrictEqual(tokens, [
    { type: 'openObject' },
    { type: 'closeObject' },
    { type: 'end' }
  ])
})

test('parse simple array', async () => {
  const input = async function*() { yield '[1,2,3]' }()
  const tokens = await collect(AsyncJsonHighGenerator(input))
  assert.deepStrictEqual(tokens, [
    { type: 'openArray' },
    { type: 'openNumber' },
    { type: 'value', value: 1 },
    { type: 'openNumber' },
    { type: 'value', value: 2 },
    { type: 'openNumber' },
    { type: 'value', value: 3 },
    { type: 'closeArray' },
    { type: 'end' },
  ])
})

test('filter token types', async () => {
  const input = async function*() { yield '{"x":42}' }()
  const tokens = await collect(
    AsyncJsonHighGenerator(input, { 
      tokenTypes: ['openObject', 'closeObject', 'value'] 
    })
  )
  
  assert.deepStrictEqual(tokens, [
    { type: 'openObject' },
    { type: 'value', value: 42 },
    { type: 'closeObject' }
  ])
})

test('invalid JSON throws', async () => {
  const input = async function*() { yield '{invalid}' }()
  
  await assert.rejects(
    () => collect(AsyncJsonHighGenerator(input))
  )
})

test('buffer long strings', async () => {
  const longString = 'x'.repeat(100)
  const input = async function*() { 
    yield `{"key":"${longString}"}` 
  }()
  
  const tokens = await collect(
    AsyncJsonHighGenerator(input, { 
      maxStringBufferLength: 10,
      tokenTypes: ['bufferString'] 
    })
  )
  
  assert.ok(tokens.some(t => t.type === 'bufferString'))
  assert.deepStrictEqual(tokens.find(t => t.type === 'bufferString'), {
    type: 'bufferString',
    buffer: longString.slice(0, 10)
  })
})

test('parse nested structures', async () => {
  const input = async function*() { 
    yield '{"users":[{"name":"Alice","scores":[1,2,3]},' 
    yield '{"name":"Bob","scores":[4,5,6]}]}' 
  }()
  
  const tokens = await collect(AsyncJsonHighGenerator(input))
  
  const expectedTokenTypes = [
    'openObject', 
    'openKey', 'key', 'openArray', 
    'openObject', 
    'openKey', 'key', 'openString', 'value', 
    'openKey', 'key', 'openArray', 
    'openNumber', 'value', 
    'openNumber', 'value', 
    'openNumber', 'value', 
    'closeArray', 
    'closeObject',
    'openObject', 
    'openKey', 'key', 'openString', 'value', 
    'openKey', 'key', 'openArray', 
    'openNumber', 'value', 
    'openNumber', 'value', 
    'openNumber', 'value', 
    'closeArray', 
    'closeObject', 
    'closeArray', 
    'closeObject', 
    'end'
  ]
  
  assert.deepStrictEqual(tokens.map(t => t.type), expectedTokenTypes)
})
