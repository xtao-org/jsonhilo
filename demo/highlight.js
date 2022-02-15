import {JsonLow} from '../JsonLow.js'

import {Utf8bs2c, Utf8c2bs} from 'https://cdn.jsdelivr.net/gh/xtao-org/utf8x2x@v0.2.1/mod.js'

const enc = new TextEncoder()

const brightGreen = [...enc.encode("[92m")]
const brightMagenta = [...enc.encode("[95m")]
const brightCyan = [...enc.encode("[96m")]
const green = [...enc.encode("[32m")]
const yellow = [...enc.encode("[33m")]
const cyan = [...enc.encode("[36m")]
const reset = [...enc.encode("[39m")]

let writeBuffer = []
const maxWriteBufferLen = 100
const write = {
  bytes(bytes) {
    writeBuffer.push(...bytes)
    if (writeBuffer.length > maxWriteBufferLen) {
      Deno.stdout.writeSync(new Uint8Array(writeBuffer))
      writeBuffer = []
    }
  },
  end() {
    if (writeBuffer.length > 0) {
      Deno.stdout.writeSync(new Uint8Array(writeBuffer))
    }
  }
}

const writeBytesFrom = Utf8c2bs({
  bytes(bs) {
    write.bytes(bs)
  }
})

const object = (codePoint) => {
  write.bytes(brightCyan)
  writeBytesFrom.codePoint(codePoint)
  write.bytes(reset)
}
const array = (codePoint) => {
  write.bytes(cyan)
  writeBytesFrom.codePoint(codePoint)
  write.bytes(reset)
}
const close = (codePoint) => {
  writeBytesFrom.codePoint(codePoint)
  write.bytes(reset)
}
const restore = () => {
  write.bytes(reset)
}

const highlight = Utf8bs2c(JsonLow(new Proxy({
  openObject: object,
  closeObject: object,
  openArray: array,
  closeArray: array,
  openKey: (codePoint) => {
    write.bytes(brightMagenta)
    writeBytesFrom.codePoint(codePoint)
  },
  closeKey: close,
  openString: (codePoint) => {
    write.bytes(green)
    writeBytesFrom.codePoint(codePoint)
  },
  closeString: close,
  openNumber: (codePoint) => {
    write.bytes(brightGreen)
    writeBytesFrom.codePoint(codePoint)
  },
  closeNumber: restore,
  openTrue: (codePoint) => {
    write.bytes(yellow)
    writeBytesFrom.codePoint(codePoint)
  },
  closeTrue: close,
  openFalse: (codePoint) => {
    write.bytes(yellow)
    writeBytesFrom.codePoint(codePoint)
  },
  closeFalse: close,
  end: () => {
    restore()
    write.end()
  },
}, {
  get(target, prop, _rec) {
    return target[prop] || (codePoint => {
      writeBytesFrom.codePoint(codePoint)
    })
  }
})))

const bufLen = 1024 * 1024
const buf = new Uint8Array(bufLen)
while (true) {
  const readLen = Deno.stdin.readSync(buf)
  if (readLen === null) break
  highlight.bytes(buf.slice(0, readLen))
}
highlight.end()