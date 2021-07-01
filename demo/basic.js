import {JsonHigh} from '../mod.js'

const stream = JsonHigh({
  openArray: () => console.log('<array>'),
  openObject: () => console.log('<object>'),
  closeArray: () => console.log('</array>'),
  closeObject: () => console.log('</object>'),
  key: (key) => console.log(`<key>${key}</key>`),
  value: (value) => console.log(`<value type="${typeof value}">${value}</value>`),
})

stream.push('{"tuple": [null, true, false, 1.2e-3, "[demo]"]}')

/* OUTPUT:
<object>
<key>tuple</key>
<array>
<value type="object">null</value>
<value type="boolean">true</value>
<value type="boolean">false</value>
<value type="number">0.0012</value>
<value type="string">[demo]</value>
</array>
</object>
*/