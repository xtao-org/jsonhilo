import {JsonLow} from '../JsonLow.js'

Deno.test('depth', () => {

  const s = JsonLow({
    openArray(c, l) {
      if (l !== depths[i++]) throw Error('fail')
    },
    openObject(c, l) {
      if (l !== depths[i++]) throw Error('fail')
    }
  })

  const depths = [1,2,3,4,5,5,3]
  let i = 0
  
  const jstr = `{"a": [{"b": [{}, {}]}, {}]}`
  
  for (const c of [...jstr]) {
    const p = c.codePointAt(0)
    s.codePoint(p)
  }
  s.end()
})