import {JsonHigh} from '../mod.js'

import test from 'node:test'
import assert, { AssertionError } from "node:assert"

// test cases for functionality requested in https://github.com/xtao-org/jsonhilo/issues/10

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
    keyBuffer(b) {
      called.push(['keyBuffer', b])
    },
    stringBuffer(b) {
      called.push(['stringBuffer', b])
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
    ['keyBuffer', 'theq'],
    ['keyBuffer', 'uick'],
    ['keyBuffer', 'brow'],
    ['keyBuffer', 'nfox'],
    'closeKey',
    'openString',
    ['stringBuffer', 'jump'],
    ['stringBuffer', 'sove'],
    ['stringBuffer', 'rthe'],
    ['stringBuffer', 'lazy'],
    ['stringBuffer', 'dog'],
    'closeString',
  ])
})

test('string vs key', async () => {
  let key = ''
  let str = ''
  const keys = []
  const strs = []
  const handlers = {
    maxBufferLength: 4,
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
    keyBuffer(b) {
      key += b
    },
    stringBuffer(b) {
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
