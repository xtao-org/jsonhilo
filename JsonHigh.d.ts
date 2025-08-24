/**
 * `JsonHigh` is called with an object which contains named event handlers that are invoked during parsing.
 * 
 * The object may also contain [options](#options) to change the default behavior, e.g. [turn off number parsing](#parseNumbers) or turn on [buffering of strings piece-by-piece](#maxStringBufferLength).
 */
export declare const JsonHigh: JsonHigh

/**
 * This is the high-level interface over {@link JsonLow} optimized for convenience. It provides similar functionality and granularity to other streaming parsers, such as [Clarinet](https://github.com/dscape/clarinet) or [creationix/jsonparse](https://github.com/creationix/jsonparse).
 */
export type JsonHigh = <Feedback, End>(
  next: JsonHighHandlers<Feedback, End>,
) => JsonHighStream<End>

/**
 * ### Return value
 * 
 * {@link JsonHigh} returns a stream object with the following methods:
 */
export type JsonHighStream<End> = {
  /**
   * Accepts a JSON chunk to parse. 
   * 
   * Returns the stream object for chaining. 
   * 
   */
  chunk(chunk: string): JsonHighStream<End>,

  /**
   * Call it to signal to the stream that the current JSON document is finished.
   * 
   * If there is no error, it will then call the corresponding `end()` event handler, and return whatever that returned.
   */
  end(): End,

  /**
   * Reports current depth (level of nesting).
   * 
   * **NOTE**: an `open*` or `close*` handler is always called *after* the depth is updated, meaning:
   * 
   * * in `openObject`/`openArray` handlers the lowest depth reported will be 1 -- we entered a top-level object/array and are now at depth 1
   * 
   * * in `closeObject`/`closeArray` handlers the lowest depth reported will be 0 -- we exited a top-level object/array and are now at depth 0 (top-level)
   */
  depth(): number,
  // todo: type for state()
}

/**
 * ### Options
 */
export type JsonHighOptions = {
  /**
   * See also: the similar {@link JsonHighOptions.bufferOnChunk} option. These options can be combined. Differences between them are marked with a strong font.
   * 
   * The maximum length of the key or string buffer, in code points.
   * 
   * If **set to a value in range `[1;Infinity)`**, the `key` event handler won't be called and, for strings, the `value` event handler won't be called. 
   * 
   * Instead, the `bufferKey` and `bufferString` handlers will be called **as soon as the given number of code points has been collected** or when the key/string is finished. 
   * 
   * In the latter case **the number of code points may be smaller than `maxStringBufferLength`** and a `closeKey`/`closeString` handler will be called after the last `buffer*` event to signal the finish. 
   * 
   * This is useful **when dealing with long strings** where it's desirable to stream them piece-by-piece, e.g. when working with LLMs (Large Language Models). 
   * 
   * See [Add support for incomplete key and value strings #10](https://github.com/xtao-org/jsonhilo/issues/10) for more information.
   * 
   * @default {Infinity}
   */
  maxStringBufferLength?: number,

  /**
   * See also: the similar {@link JsonHighOptions.maxStringBufferLength} option. These options can be combined. Differences between them are marked with a strong font.
   * 
   * If **set to `true`**, the `key` event handler won't be called and, for strings, the `value` event handler won't be called. 
   * 
   * Instead, the `bufferKey` and `bufferString` handlers will be called **as soon as the current chunk (passed in via the `.chunk()` method of the stream) has been processed** or when the key/string is finished. 
   * 
   * In the latter case a `closeKey`/`closeString` handler will be called after the last `buffer*` event to signal the finish.
   * 
   * This is useful **when it's desirable to stream strings or keys piece-by-piece, in sync with the chunks being received, without needing to specify a fixed buffer length;** e.g. when working with LLMs (Large Language Models).
   * 
   * See [Add support for incomplete key and value strings #10](https://github.com/xtao-org/jsonhilo/issues/10) for more information.
   * 
   * @default {false}
   */
  bufferOnChunk?: boolean,

  /**
   * Specifies the maximum length of a number value (in characters).
   * 
   * @default {8192} 
   */
  maxNumberLength?: number,

  /**
   * Controls whether numbers should be parsed (converted to JavaScript `number` type) which is the case by default. 
   * 
   * If set to `false`, the `value` event handler won't be called for numbers. Instead, the `bufferNumber` handler will be called with the number as a string.
   * 
   * This is useful when dealing with big numbers which would lose precision when converted to the `number` type.
   * 
   * @default {true}
   */
  parseNumbers?: boolean,
}

/** ### Basic events
 * 
 * The basic usage of `JsonHigh` involves 4 event handlers without arguments which indicate start and end of structures:
 * * {@link JsonHighEvents.openArray}
 * * {@link JsonHighEvents.closeArray}
 * * {@link JsonHighEvents.openObject}
 * * {@link JsonHighEvents.closeObject}
 * 
 * And 2 event handlers with one argument which capture primitives:
 * 
 * * {@link JsonHighEvents.key}
 * * {@link JsonHighEvents.value}
 * 
 * Finally, there is the argumentless {@link JsonHighEvents.end} event handler.
 * 
 * ### Extra events
 * 
 * These handlers take no arguments:
 * 
 * * {@link JsonHighEvents.openKey}
 * * {@link JsonHighEvents.openString}
 * * {@link JsonHighEvents.openNumber}
 * 
 * ### Conditional events
 * 
 * These handlers take no arguments:
 * 
 * * {@link JsonHighEvents.closeKey}
 * * {@link JsonHighEvents.closeString}
 * 
 * These handlers receive the buffer that should be consumed:
 * 
 * * {@link JsonHighEvents.bufferKey}
 * * {@link JsonHighEvents.bufferString}
 * * {@link JsonHighEvents.bufferNumber}
 */
export type JsonHighEvents<Feedback, End> = {
  /**
   * An array started (`[`).
   */
  openArray?: JsonHighHandler<Feedback>,

  /**
   * An array ended (`]`).
   */
  closeArray?: JsonHighHandler<Feedback>,

  /**
   * An object started (`{`).
   */
  openObject?: JsonHighHandler<Feedback>,

  /**
   * An object ended (`}`).
   */
  closeObject?: JsonHighHandler<Feedback>,

  /**
   * An object's key ended. 
   * 
   * The argument of the handler contains the key as a JavaScript string.
   * 
   * `[conditional]` Called only in default (non-buffering) mode.
   * 
   * This event can be suppressed by setting {@link JsonHighOptions.maxStringBufferLength}.
   */
  key?: (key: string) => Feedback,

  /**
   * A primitive JSON value ended. 
   * 
   * The argument of the event contains the corresponding JavaScript value: `true`, `false`, `null`, a number, or a string.
   * 
   * This event can be suppressed for strings if {@link JsonHighOptions.maxStringBufferLength} is set and for numbers if {@link JsonHighOptions.parseNumbers} is set to `false`.
   *
   */
  value?: (value: string | number | null | boolean) => Feedback,

  /**
   * Called by the `end` method of the stream to confirm that the parsed JSON document is complete and valid.
   */
  end?: () => End,

  /**
   * A key started (`"`, in key position).
   */
  openKey?: JsonHighHandler<Feedback>,

  /**
   * A string value started (`"`).
   */
  openString?: JsonHighHandler<Feedback>,

  /**
   * A number value started.
   */
  openNumber?: JsonHighHandler<Feedback>,

  /**
   * A key ended (`"`).
   * 
   * `[conditional]` Called instead of the `key` event **when `maxStringBufferLength` is set**.
   */
  closeKey?: JsonHighHandler<Feedback>,

  /** 
   * A string value ended (`"`).
   * 
   * `[conditional]` Called instead of the `value` event **when `maxStringBufferLength` is set**.
   * 
   * @tags conditional
   */
  closeString?: JsonHighHandler<Feedback>,
  
  /**
   * Key buffer is ready for consumption.
   * 
   * `[conditional]` Called instead of the `key` event **when `maxStringBufferLength` is set**.
   * 
   * The `buffer` then contains `maxStringBufferLength` code points or possibly less if we reached the end of a key.
   */
  bufferKey?: (buffer: string) => Feedback,

  /**
   * String buffer is ready for consumption.
   *
   * `[conditional]` For string values, called instead of the `value` event **when `maxStringBufferLength` is set**.
   *
   * The buffer then contains `maxStringBufferLength` code points or possibly less if we reached the end of a string value.
   */
  bufferString?: (buffer: string) => Feedback,

  /**
   * Number buffer is ready for consumption.
   * 
   * `[conditional]` For number values, called instead of the `value` event **when `parseNumbers` is set**.
   * 
   * The buffer then contains the unparsed number (represented as a string).
   */
  bufferNumber?: (buffer: string) => Feedback,
}

/**
 * TODO: this should be called something like JsonHighParameters or JsonHighArguments or sth.
 */
export type JsonHighHandlers<Feedback, End> = JsonHighOptions & JsonHighEvents<Feedback, End>

/** TODO: doc */
export type JsonHighHandler<Feedback> = () => Feedback