import {JsonLow} from '../JsonLow.js'

const encodeUtf8 = (codePoint) => {
  if (codePoint <= 0x7F) {
    return new Uint8Array([codePoint]);
  }
  else if (codePoint <= 0x07FF) {
    return new Uint8Array([
      (((codePoint >> 6) & 0x1F) | 0xC0), 
      (((codePoint >> 0) & 0x3F) | 0x80),
    ]);
  }
  else if (codePoint <= 0xFFFF) {
    return new Uint8Array([
      (((codePoint >> 12) & 0x0F) | 0xE0),
      (((codePoint >>  6) & 0x3F) | 0x80),
      (((codePoint >>  0) & 0x3F) | 0x80),
    ])
  }
  else if (codePoint <= 0x10FFFF) {
    return new Uint8Array([
      (((codePoint >> 18) & 0x07) | 0xF0),
      (((codePoint >> 12) & 0x3F) | 0x80),
      (((codePoint >>  6) & 0x3F) | 0x80),
      (((codePoint >>  0) & 0x3F) | 0x80),
    ])
  }
  else throw Error(`unexpected ${codePoint}`)
}

const enc = new TextEncoder()
const e92 = enc.encode("[92m")
const e95 = enc.encode("[95m")
const e96 = enc.encode("[96m")
const e32 = enc.encode("[32m")
const e34 = enc.encode("[34m")
const e36 = enc.encode("[36m")
const e39 = enc.encode("[39m")

const object = (codePoint) => {
  Deno.stdout.writeSync(e96)
  Deno.stdout.writeSync(encodeUtf8(codePoint))
}
const array = (codePoint) => {
  Deno.stdout.writeSync(e36)
  Deno.stdout.writeSync(encodeUtf8(codePoint))
}
const inter = (codePoint) => {
  Deno.stdout.writeSync(e34)
  Deno.stdout.writeSync(encodeUtf8(codePoint))
}
const close = (codePoint) => {
  Deno.stdout.writeSync(encodeUtf8(codePoint))
  Deno.stdout.writeSync(e39)
}
const restore = () => Deno.stdout.writeSync(e39)

const stream = JsonLow(new Proxy({
  openString: (codePoint) => {
    Deno.stdout.writeSync(e95)
    Deno.stdout.writeSync(encodeUtf8(codePoint))
  },
  openKey: (codePoint) => {
    Deno.stdout.writeSync(e32)
    Deno.stdout.writeSync(encodeUtf8(codePoint))
  },
  openObject: object,
  closeObject: object,
  openArray: array,
  closeArray: array,
  openNumber: (codePoint) => {
    Deno.stdout.writeSync(e92)
    Deno.stdout.writeSync(encodeUtf8(codePoint))
  },
  openString: (codePoint) => {
    Deno.stdout.writeSync(e95)
    Deno.stdout.writeSync(encodeUtf8(codePoint))
  },
  colon: inter,
  comma: inter,
  closeString: close,
  closeKey: close,
  openObject: close,
  closeObject: close,
  openArray: close,
  closeArray: close,
  colon: close,
  comma: close,
  closeNumber: restore,
  end: restore,
}, {
  get(target, prop, rec) {
    return target[prop] || (codePoint => {
      Deno.stdout.writeSync(encodeUtf8(codePoint))
    })
  }
}))


const bufLen = 1024 * 1024
const buf = new Uint8Array(bufLen)
let partialCodePoint = 0
let bytesRemain = 0

while (true) {
  const readLen = Deno.stdin.readSync(buf)
  if (readLen === null) break
  let i = 0
  while (i < readLen) {
    const byte = buf[i]

    ++i
    if (bytesRemain > 0) {
      const bits = byte & 0b00111111
      --bytesRemain
      partialCodePoint |= bits << (bytesRemain * 6)

      if (bytesRemain === 0) {
        stream.codePoint(partialCodePoint)
      }
    } 
    else if (byte < 128) stream.codePoint(byte)
    else {
      if ((byte >> 5) === 0b110) {
        bytesRemain = 1
        partialCodePoint = (byte & 0b00011111) << 6
      }
      else if ((byte >> 4) === 0b1110) {
        bytesRemain = 2
        partialCodePoint = (byte & 0b00001111) << 12
      }
      else if ((byte >> 3) === 0b11110) {
        bytesRemain = 3
        partialCodePoint = (byte & 0b00000111) << 18
      }
      else {
        console.error(byte, byte.toString(2), String.fromCodePoint(byte))
        throw Error('unexpected')
      }
    }
  }
}
stream.end()