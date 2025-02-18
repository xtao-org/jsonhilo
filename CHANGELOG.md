# v0.4.0 / 2025-02-18 / An LLM and big number friendly release

* **BREAKING** (slightly): `PosInfoAdapter` (and so `JsonHigh`) now report lines and colums starting from 1 (as is tradition) instead of 0

Issues/PRs:

* Issue [#10](https://github.com/xtao-org/jsonhilo/issues/10) / PR [#11](https://github.com/xtao-org/jsonhilo/pull/11) -- support incomplete strings in `JsonHigh`
  * Added the `maxStringBufferLength` option and associated `bufferKey`, `bufferString`, `closeKey`, and `closeString` events
  * Exposed `openKey`, `openString`, and `openNumber` events
  * Added the `parseNumbers` and `maxNumberLength` options to support numbers of arbitrary precision
* Improved docs, added some docstrings to `JsonHigh`
* Simplified error handling in `JsonHigh`

# v0.3.8 / 2025-02-07 / A deep release

Exposed current depth via `JsonLow.depth()` and `JsonHigh.depth()` ([PR #9](https://github.com/xtao-org/jsonhilo/pull/9), [issue #8](https://github.com/xtao-org/jsonhilo/issues/8)).

# v0.3.7 / 2024-08-27 / An error-handling release

Documented error handling, added `isError` in [PR #7](https://github.com/xtao-org/jsonhilo/pull/7), addressing [issue #6](https://github.com/xtao-org/jsonhilo/issues/6).

# 0.3.4-0.3.6

No changes in code. Added means of supporting the project.

# 0.3.3

[@rafern](https://github.com/rafern) in [#4](https://github.com/xtao-org/jsonhilo/pull/4) improved TypeScript support, ability to restore state and configuration.

# 0.3.2

No change in code.

Update README quickstart example to work in Node.js.

# 0.3.1

(Cosmetic) Introduce the isKey state flag in [#2](https://github.com/xtao-org/jsonhilo/pull/2).

Created an npm package under `@xtao-org/jsonhilo`.

# 0.3.0

Breaking: renamed the `push` method of `JsonHigh` to `chunk`.

`JsonLow` state is now accessible thru `JsonLow#state()` and `JsonHigh#state()`.

Fixed types.

Updated `demo/highlight.js`.

# 0.2.0

Breaking: renamed the `push` method of `JsonLow` to `codePoint`.

Breaking: renamed the `push` method of `PosInfoAdapter` to `codePoint` (`PosInfoAdapter` is a Proxy that wraps `JsonLow`).
