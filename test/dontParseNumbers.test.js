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
    buffer(v) {
      called.push(v)
    },
    openNumber() {
      called.push('openNumber')
    },
    closeNumber() {
      called.push('closeNumber')
    },
  }
  const stream = JsonHigh(handlers)
  stream.chunk(`
    {"number": 1234454765467585464.32424}
  `)

  assert.deepEqual(called, [
    'openNumber',
    '1234454765467585464.32424',
    'closeNumber',
  ])
})

test(`don't parse numbers + max buffer length`, () => {
  const called = []
  const handlers = {
    maxBufferLength: 4,
    parseNumbers: false,
    value(v) {
      throw AssertionError(`Unexpected value: ${v}`)
    },
    buffer(v) {
      called.push(v)
    },
    openNumber() {
      called.push('openNumber')
    },
    closeNumber() {
      called.push('closeNumber')
    },
  }
  const stream = JsonHigh(handlers)
  stream.chunk(`
    {"number": 1234454765467585464.32424}
  `)

  assert.deepEqual(called, [
    // todo: do we want ['numb', 'er'] here?
    'numb',
    'er',
    'openNumber',
    '1234',
    '4547',
    '6546',
    '7585',
    '464.',
    '3242',
    '4',
    'closeNumber',
  ])
})