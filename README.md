<img src="logo.png" alt="logo" height="128" />

# JsonHilo.js

[`[📢 blog post]`](https://djedr.github.io/posts/jsonhilo-2021-07-29.html)

[![](https://data.jsdelivr.com/v1/package/gh/xtao-org/jsonhilo/badge)](https://www.jsdelivr.com/package/gh/xtao-org/jsonhilo)

Minimal [lossless](#lossless) JSON parse event streaming, akin to [SAX](https://en.wikipedia.org/wiki/Simple_API_for_XML).

***

Handcrafted by <a href="https://djedr.github.io">Darius J Chuck</a>.

<a href="https://donate.stripe.com/00gdUicLv4UueeQcMM" target="_blank"><img src="https://raw.githubusercontent.com/djedr/djedr.github.io/master/gfx/donate-but.svg" style="height: 32px" alt="Donate directly via Stripe" title="Donate directly via Stripe"></a>
&nbsp;
or
&nbsp;
<a href='https://ko-fi.com/djedr' target='_blank'><img width="120" style='border:0px;width:120px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' alt='Buy Me a Coffee at ko-fi.com' /></a>
&nbsp;
<a href="https://buycoffee.to/jevko" target="_blank"><img width="120" src="https://buycoffee.to/btn/buycoffeeto-btn-primary.svg" style="width: 120px" alt="Postaw mi kawę na buycoffee.to"></a>

***

[Fast](#fast), [modular](#modular), and dependency-free. 

Provides two interfaces: a [**hi**gh-level](#jsonhigh) one and a [**lo**w-level](#jsonlow) one.

Written in [runtime-independent](#runtime-independent) JavaScript. 

Works in [Deno](https://deno.land/), [Node.js](https://nodejs.org), and the browser.

## Status

Stable.

[Passes standards-compliance tests](#standards-compliant) and [performs well in benchmarks](#fast).

Somewhat battle-tested.

## Installation

### Node.js

An [npm package](https://www.npmjs.com/package/@xtao-org/jsonhilo) is available:

```
npm i @xtao-org/jsonhilo
```

### Deno and the browser

Import modules directly from [deno.land/x](https://deno.land/x):

```js
import {JsonHigh} from 'https://deno.land/x/jsonhilo@v0.3.3/mod.js'
```

Or from a CDN such as [jsDelivr](https://www.jsdelivr.com/):

```js
import {JsonHigh} from 'https://cdn.jsdelivr.net/gh/xtao-org/jsonhilo@v0.3.3/mod.js'
```

<!-- An easy alternative that will work for all environments is to copy and use [`jsonhilo.bundle.js`](jsonhilo.bundle.js), e.g.:

```
curl https://raw.githubusercontent.com/tree-annotation/json-stream-js/jsonhilo.bundle.js > jsonhilo.bundle.js
```

and then:

```js
import {JsonHigh} from 'jsonhilo.bundle.js'
```

The bundle was obtained with [`deno bundle`](https://deno.land/manual/tools/bundler) and exports the same modules as [`mod.js`](mod.js), all dependencies included. -->

## Quickstart

See a basic example in [`demo/basic.js`](demo/basic.js), pasted below:

```js
import {JsonHigh} from '@xtao-org/jsonhilo'
const stream = JsonHigh({
  openArray: () => console.log('<array>'),
  openObject: () => console.log('<object>'),
  closeArray: () => console.log('</array>'),
  closeObject: () => console.log('</object>'),
  key: (key) => console.log(`<key>${key}</key>`),
  value: (value) => console.log(`<value type="${typeof value}">${value}</value>`),
})
stream.chunk('{"tuple": [null, true, false, 1.2e-3, "[demo]"]}')
```

This uses [the simplified high-level interface](#jsonhigh) built on top of the [more powerful low-level core](#jsonlow).

## Features

* Simple and minimal
* Dependency-free
* [Runtime-independent](#runtime-independent)
* [Lossless](#lossless)
* [Modular](#modular)
* [Fast](#fast)
* [Streaming-friendly](#streaming-friendly)
* [Optionally standards-compliant](#standards-compliant)
* [Unicode-compatible](#unicode-compatible)

## Runtime-independent

The library logic is written in modern JavaScript and relies upon some of its features, standard modules in particular.

Beyond that it does not use any runtime-specific features and should work in any *modern* JavaScript environment. It was tested in Deno, Node.js, and the browser.

That said, the primary target runtime is Deno, and tests depend on it.

## Lossless

Unlike any other known streaming JSON parser, JsonHilo provides a [low-level](#jsonlow) interface for *lossless* parsing, i.e. it is possible to recover the *exact* input, including whitespace and string escape sequences, from parser events.

This feature can be used to implement accurate translators from JSON to other representations (see [Rationale](#rationale)), syntax highlighters (demo below), JSON scanners that search for substrings in strings on-the-fly, without first loading them into memory, and more.

<img src="highlight.gif" alt="Highlight demo" height="320" />

Pictured above is the syntax highlighting demo: [demo/highlight.js](demo/highlight.js)

## Modular

The library is highly modular with [a fully independent core](#jsonlow), around which various adapters and extensions are built, including [an easy-to-use high-level interface](#jsonhigh).

## JsonLow

The core module is [**`JsonLow.js`**](JsonLow.js). It has no dependencies, so it can be used on its own. It is very minimal and optimized for maximum performance and accuracy, as well as minimum memory footprint. It provides the most fine-grained control over the parsing process. The events generated by the parser carry enough information to losslessly recreate the input exactly, including whitespace.

See [**JsonLow.d.ts**](JsonLow.d.ts) for type information and [demo/highlight.js](demo/highlight.js) for usage example.

<!-- *Detailed description to be written.* -->

## JsonHigh

[**`JsonHigh.js`**](JsonHigh.js) is the high-level module which provides a more convenient interface. It is composed of auxiliary modules and adapters built around the core. It is optimized for convenience and provides similar functionality and granularity to other streaming parsers, such as [Clarinet](https://github.com/dscape/clarinet) or [creationix/jsonparse](https://github.com/creationix/jsonparse).

See [**JsonHigh.d.ts**](JsonHigh.d.ts) for type information and [Quickstart](#quickstart) for usage example.

### Parameters

`JsonHigh` is called with an object which contains named event handlers that are invoked during parsing. All handlers are optional and described [below](#events).

### Return value

`JsonHigh` returns a stream object with two methods:

* `chunk` which accepts a JSON chunk to parse. It returns the stream object for chaining. 
* `end` with no arguments which signals that parsing is completed. It calls the corresponding `end` event handler, passing its return value to the caller.

### Events

There are 4 event handlers without arguments which indicate start and end of structures:

* `openArray`: an array started (`[`)
* `closeArray`: an array ended (`]`)
* `openObject`: an object started (`{`)
* `closeObject`: an object ended (`}`)

And 2 event handlers with one argument which capture primitives:

* `key`: an object's key ended. The argument of the handler contains the key as a JavaScript string.
* `value`: a primitive JSON value ended. The argument of the event contains the corresponding JavaScript value: `true`, `false`, `null`, a number, or a string.

Finally, there is the argumentless `end` event handler which is called by the `end` method of the stream.

## Fast

Achieving optimal performance without sacrificing simplicity and correctness was a design goal of JsonHilo. This goal was realized and for applications without extreme performance requirements JsonHilo should be more than fast enough.

It may be worth noting however that using pure JavaScript for extremely performance-sensitive applications is ill-advised and that nothing can replace individual case-by-case benchmarks.

It is difficult to find a parser that can be sensibly compared with JsonHilo. The one that comes the closest and is fairly widely known is [Clarinet](https://github.com/dscape/clarinet). It is the only low-level streaming JSON parser featured on [JSON.org](https://www.json.org) and the fastest one I could find.

[xtao-org/jsonhilo-benchmarks](https://github.com/xtao-org/jsonhilo-benchmarks) contains simple benchmarks used to compare the performance of JsonHilo with Clarinet and [jq](https://stedolan.github.io/jq/) (a fast and versatile command-line JSON processor).

According to these benchmarks, for validating JSON (just parsing without any further processing) JsonHilo is the fastest, before jq, which is in turn faster than Clarinet. Overall for comparable tasks the low-level JsonHilo interface is up to 2x faster than Clarinet, whereas the high-level interface is on par.

Again, these results need to be taken with a grain of salt, and there is no replacement for individual benchmarks. Use whatever suits your case best. In most cases, relative performance should not be the only factor to take into account.

Factors which make a fair comparison between JsonHilo and Clarinet problematic are mentioned below.

### Differences between JsonHilo and Clarinet

The major differences that make the comparison of the two problematic are:

* [Clarinet is not fully ECMA-404-compliant](https://github.com/dscape/clarinet/issues/49), as measured by [JSON Parsing Test Suite by Nicolas Seriot](https://github.com/nst/JSONTestSuite) -- it accepts certain invalid JSON and rejects certain valid JSON. JsonHilo is designed to parse the JSON grammar correctly and so [can pass the ECMA-404-compliance test suite](#standards-compliant). JsonHilo is overall safer to use with unknown inputs -- it can very well be used as a validator.
* JsonHilo fundamentally operates on individual Unicode code points as opposed to strings, chunks, or characters. Performance-wise this may be an advantage or a disadvantage, depending on how the input is structured (it may need conversion). 
* Even though low-level processing with JsonHilo may be overall significantly faster than Clarinet, the fact that the former does not use regular expressions to parse the input while the latter does may lead to a narrower performance gap between the two.
* JsonHilo is overall simpler in terms of code complexity, making it easier to adjust or audit. The code is also significantly smaller in size than Clarinet, even taking into account the optional high-level interfaces laid on top of the tiny core.
* JsonHilo's core is more low-level and amenable to extension.

## Streaming-friendly

By default the parser is streaming-friendly by accepting the following:

* Multiple consecutive top-level JSON values -- it can read [line-delimited JSON and concatenated JSON](https://en.wikipedia.org/wiki/JSON_streaming), e.g. [JSON Lines](https://jsonlines.org/), [ndjson](http://ndjson.org/). Whitespace-separated primitives are also supported.

* [Trailing commas](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Trailing_commas) -- a single trailing comma in an array or an object generates no errors.

* Zero-length or whitespace-only input -- generates no errors.

## Standards-compliant

The [streaming-friendly features](#streaming-friendly) can be supressed by [**`Ecma404.js`**](Ecma404.js), an adapter module which provides full [ECMA-404](https://www.ecma-international.org/wp-content/uploads/ECMA-404_2nd_edition_december_2017.pdf)/[RFC 8259](https://datatracker.ietf.org/doc/html/rfc8259) compliance.

This is confirmed by passing the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite) by [Nicolas Seriot](https://github.com/nst), available under `test/JSONTestSuite`.

Tests can be run with Deno as follows:

```
deno test --allow-read
```

## Unicode-compatible

The [core logic](#jsonlow) operates on Unicode code points -- in line with spec -- rather than code units or characters.

## Rationale

Initially written to enable fast lossless translation between JSON and [Jevko](https://jevko.org), as no suitable JSON parser in JavaScript exists.

I decided to release this as a separate library, because I was tinkering with Deno and found that there was [no streaming JSON parser available at all for Deno](https://stackoverflow.com/questions/58070346/reading-large-json-file-in-deno).

## See also

[JsonStrum](https://github.com/xtao-org/jsonstrum) -- a high-level wrapper over JsonHilo which emits fully parsed objects and arrays.

## License

Released under the [MIT](LICENSE) license.

## Support this project

<p>I prefer to share my creations for free. However living and creating without money is not possible for me. So I ask companies and people, who want and can, for support. Every symbolic cup of coffee counts!</p>

<div class="flexi" style="flex-wrap: wrap;">
  <a href="https://donate.stripe.com/00gdUicLv4UueeQcMM" target="_blank"><img src="https://raw.githubusercontent.com/djedr/djedr.github.io/master/gfx/donate-but.svg" style="height: 64px" alt="Donate directly via Stripe" title="Donate directly via Stripe"></a>
  &nbsp;
  or
  &nbsp;
  <a href='https://ko-fi.com/djedr' target='_blank'><img width='240' style='border:0px;width:240px;' src='https://storage.ko-fi.com/cdn/kofi1.png?v=3' alt='Buy Me a Coffee at ko-fi.com' /></a>
  &nbsp;
  <a href="https://buycoffee.to/jevko" target="_blank"><img width='240' src="https://buycoffee.to/btn/buycoffeeto-btn-primary.svg" style="width: 240px" alt="Postaw mi kawę na buycoffee.to"></a>
</div>

## Paid support and online assistance

If you prefer, [you can get paid help and support, including direct online assistance, related to JsonHilo.js through Githelp.](https://githelp.app/repos/jsonhilo)

At the moment this is a limited opportunity to try an early version of Githelp.

***

<img src="tao-json.png" alt="tao-json-logo" height="128" />

A stand-alone part of the [TAO](https://xtao.org)-JSON project.

© 2024 [xtao.org](https://xtao.org)