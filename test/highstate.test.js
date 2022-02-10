import {JsonHigh} from '../JsonHigh.js'

Deno.test('hs', () => {

  const s = JsonHigh({
  })
  
  const jstr = `{"a": [{"b": [{}, {}]}, {}]}`
  
  s.push(jstr)
  console.log(s.state())
  // for (const c of [...jstr]) {
  //   const p = c.codePointAt(0)
  // }
  s.end()
})