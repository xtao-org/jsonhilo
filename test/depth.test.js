import {JsonLow} from '../JsonLow.js'

Deno.test('depth', () => {

  const s = JsonLow({
    openArray(_, l) {
      if (l !== depths[i++]) throw Error('fail')
    },
    openObject(_, l) {
      if (l !== depths[i++]) throw Error('fail')
    },
    closeArray(_, l) {
      if (l !== depths[i++]) throw Error('fail')
    },
    closeObject(_, l) {
      if (l !== depths[i++]) throw Error('fail')

    }
  })

  const depths = [1,2,3,4,5,5,5,5,4,3,3,3,2,1]
  let i = 0
  
  const jstr = `{"a": [{"b": [{}, {}]}, {}]}`
  
  for (const c of [...jstr]) {
    const p = c.codePointAt(0)
    s.codePoint(p)
  }
  s.end()
})