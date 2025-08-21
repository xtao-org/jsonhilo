import { JsonHigh } from "./JsonHigh.js";
// note: most tokens have no attributes;
//       no need to generate new objects each time for them
//       reusing the same objects avoids generating excess garbage
const openArrayToken = Object.freeze({ type: 'openArray' });
const closeArrayToken = Object.freeze({ type: 'closeArray' });
const openObjectToken = Object.freeze({ type: 'openObject' });
const closeObjectToken = Object.freeze({ type: 'closeObject' });
const openKeyToken = Object.freeze({ type: 'openKey' });
const openStringToken = Object.freeze({ type: 'openString' });
const openNumberToken = Object.freeze({ type: 'openNumber' });
const closeKeyToken = Object.freeze({ type: 'closeKey' });
const closeStringToken = Object.freeze({ type: 'closeString' });
const endToken = Object.freeze({ type: 'end' });
// note: these are constant, so can reuse to avoid garbage as well
const trueToken = Object.freeze({ type: 'value', value: true });
const falseToken = Object.freeze({ type: 'value', value: false });
const nullToken = Object.freeze({ type: 'value', value: null });
const allTokenTypes = ["openArray", "closeArray", "openObject", "closeObject", "openKey", "openString", "openNumber", "closeKey", "closeString", "bufferKey", "bufferString", "bufferNumber", "key", "value", "end"];
export const AsyncJsonHighGenerator = (chunks, options = {}) => {
    const q = [];
    const { tokenTypes = allTokenTypes, ...rest } = options;
    const ts = new Set(tokenTypes);
    const hs = { ...rest };
    if (ts.has('openArray'))
        hs.openArray = () => q.push(openArrayToken);
    if (ts.has('closeArray'))
        hs.closeArray = () => q.push(closeArrayToken);
    if (ts.has('openObject'))
        hs.openObject = () => q.push(openObjectToken);
    if (ts.has('closeObject'))
        hs.closeObject = () => q.push(closeObjectToken);
    if (ts.has('openKey'))
        hs.openKey = () => q.push(openKeyToken);
    if (ts.has('openString'))
        hs.openString = () => q.push(openStringToken);
    if (ts.has('openNumber'))
        hs.openNumber = () => q.push(openNumberToken);
    if (ts.has('closeKey'))
        hs.closeKey = () => q.push(closeKeyToken);
    if (ts.has('closeString'))
        hs.closeString = () => q.push(closeStringToken);
    if (ts.has('end'))
        hs.end = () => q.push(endToken);
    if (ts.has('key'))
        hs.key = (key) => q.push({ type: 'key', key });
    if (ts.has('value'))
        hs.value = (value) => {
            if (value === true)
                q.push(trueToken);
            else if (value === false)
                q.push(falseToken);
            else if (value === null)
                q.push(nullToken);
            else
                q.push({ type: 'value', value });
        };
    if (ts.has('bufferKey'))
        hs.bufferKey = (buffer) => {
            q.push({ type: 'bufferKey', buffer });
        };
    if (ts.has('bufferString'))
        hs.bufferString = (buffer) => {
            q.push({ type: 'bufferString', buffer });
        };
    if (ts.has('bufferNumber'))
        hs.bufferNumber = (buffer) => {
            q.push({ type: 'bufferNumber', buffer });
        };
    const jh = JsonHigh(hs);
    return (async function* () {
        for await (const v of chunks) {
            jh.chunk(v);
            while (q.length > 0)
                yield q.shift();
        }
        jh.end();
        while (q.length > 0)
            yield q.shift();
        return;
    })();
};
