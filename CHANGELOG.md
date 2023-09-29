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
