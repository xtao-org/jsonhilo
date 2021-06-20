import {JsonHigh, JsonHighEventType} from 'https://deno.land/x/jsonhilo@v0+2021-06-20+r1+beta/mod.js'

const stream = JsonHigh((event) => {
  switch (event.type) {
  case JsonHighEventType.openArray:
  case JsonHighEventType.openObject:
  case JsonHighEventType.closeArray:
  case JsonHighEventType.closeObject:
    console.log(event.type)
    break
  case JsonHighEventType.key:
    console.log('key:', event.key)
    break
  case JsonHighEventType.value:
    console.log('value:', typeof event.value, event.value)
    break
  }
})

stream.push('{"array": [null, true, false, 1.2e-3, "[demo]"]}')

/* OUTPUT:
JsonHighEventType.openObject
key: array
JsonHighEventType.openArray
value: object null
value: boolean true
value: boolean false
value: number 0.0012
value: string [demo]
JsonHighEventType.closeArray
JsonHighEventType.closeObject
*/