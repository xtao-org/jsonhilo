import {isError, JsonHigh} from '../mod.js'

Deno.test('error handling', async () => {
  // based on a user-provided example from https://github.com/xtao-org/jsonhilo/issues/6
  const handlers = {
    end: () => {
      throw Error('Expected end handler not to be called!')
    },
  }
  const stream = JsonHigh(handlers)
  const writable = new WritableStream({
    write: (chunk) => {
      const decoded = new TextDecoder().decode(chunk)
      stream.chunk(decoded)
    },
    close: () => {
      const ret = stream.end()
      if (isError(ret) === false) {
        throw Error('Expected error to be returned by stream.end()!')
      }
    },
  })
  const readable = new ReadableStream({
      start(controller) {
          controller.enqueue(new TextEncoder().encode('{"a":2,"b":3'))
          controller.close()
      },
  })
  await readable.pipeTo(writable)
})