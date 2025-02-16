import {JsonHigh} from '../mod.js'

import test from 'node:test'
import assert, { AssertionError } from "node:assert"

test(`don't parse numbers`, () => {
  const called = []
  const handlers = {
    parseNumbers: false,
    value(v) {
      throw AssertionError(`Unexpected value: ${v}`)
    },
    numberBuffer(v) {
      called.push(v)
    },
  }
  const stream = JsonHigh(handlers)
  stream.chunk(`
    {"number": 1234454765467585464.32424}
  `)

  assert.deepEqual(called, [
    '1234454765467585464.32424',
  ])
})

test('hard limit on number length', () => {
  const handlers = {
    parseNumbers: false,
    maxNumberLength: 4,
  }
  const stream = JsonHigh(handlers)
  assert.throws(() => {
    stream.chunk(`
      {"number": 1234454765467585464.32424}
    `)
  }, /Number length over the limit of 4!/)
})