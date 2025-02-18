import {JsonHigh} from '../mod.js'

import test from 'node:test'
import assert, { AssertionError } from "node:assert"

// test cases for functionality requested in https://github.com/xtao-org/jsonhilo/issues/10

test('max string buffer length', async () => {
  const called = []
  const handlers = {
    maxStringBufferLength: 4,
    value(v) {
      throw AssertionError(`Unexpected value: ${v}`)
    },
    key(k) {
      throw AssertionError(`Unexpected key: ${k}`)
    },
    bufferKey(b) {
      called.push(['bufferKey', b])
    },
    bufferString(b) {
      called.push(['bufferString', b])
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
    ['bufferKey', 'theq'],
    ['bufferKey', 'uick'],
    ['bufferKey', 'brow'],
    ['bufferKey', 'nfox'],
    'closeKey',
    'openString',
    ['bufferString', 'jump'],
    ['bufferString', 'sove'],
    ['bufferString', 'rthe'],
    ['bufferString', 'lazy'],
    ['bufferString', 'dog'],
    'closeString',
  ])
})

test('string vs key', async () => {
  let key = ''
  let str = ''
  const keys = []
  const strs = []
  const handlers = {
    maxStringBufferLength: 4,
    value(v) {
      throw AssertionError(`Unexpected value: ${v}`)
    },
    openKey() {
      key = ''
    },
    closeKey() {
      keys.push(key)
    },
    openString() {
      str = ''
    },
    closeString() {
      strs.push(str)
    },
    bufferKey(b) {
      key += b
    },
    bufferString(b) {
      str += b
    },
  }
  const stream = JsonHigh(handlers)
  stream.chunk(`
    {"thequickbrownfox": "jumpsoverthelazydog", "lorem": "ipsum"}
  `)

  assert.deepEqual(keys, [
    "thequickbrownfox",
    "lorem",
  ])
  assert.deepEqual(strs, [
    "jumpsoverthelazydog",
    "ipsum",
  ])
})
