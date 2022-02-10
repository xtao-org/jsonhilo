# 0.3.0

Breaking: renamed the `push` method of `JsonHigh` to `chunk`.
`JsonLow` state is now accessible thru `JsonLow#state()` and `JsonHigh#state()`.
Fixed types.

# 0.2.0

Breaking: renamed the `push` method of `JsonLow` to `codePoint`. 
Breaking: renamed the `push` method of `PosInfoAdapter` to `codePoint` (`PosInfoAdapter` is a Proxy that wraps `JsonLow`).
