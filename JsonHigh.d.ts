export declare const JsonHigh: JsonHigh
export type JsonHigh = <Feedback, End>(
  next: JsonHighHandlers<Feedback, End>,
) => {
  chunk(chunk: string): Feedback,
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
export type JsonHighHandlers<Feedback, End> = {
  /**
   * ### Options
   */

  /**
   * @defaultValue `Infinity`
   * 
   * The maximum length of the key or string buffer, in code points.
   * 
   * If set, the `key` event handler won't be called and, for strings, the `value` event handler won't be called. 
   * 
   * Instead, the `bufferKey` and `bufferString` handlers will be called as soon as the given number of code points has been collected or when the key/string is finished. 
   * 
   * In the latter case the number of code points may be smaller than `maxStringBufferLength` and a `closeKey`/`closeString` handler will be called after the last `*Buffer` event to signal the finish. 
   * 
   * This is useful when dealing with long strings where it's desirable to stream them piece-by-piece, e.g. when working with LLMs (Large Language Models). 
   * 
   * See [Add support for incomplete key and value strings #10](https://github.com/xtao-org/jsonhilo/issues/10) for more information.
   * 
   */
  maxStringBufferLength?: number,

  /**
   * @defaultValue `8192`
   * 
   * Specifies the maximum length of a number value (in characters).
   * 
   */
  maxNumberLength?: number,

  /**
   * @defaultValue `true`
   * 
   * Controls whether numbers should be parsed (converted to JavaScript `number` type) which is the case by default. 
   * 
   * If set to `false`, the `value` event handler won't be called for numbers. Instead, the `bufferNumber` handler will be called with the number as a string.
   * 
   * This is useful when dealing with big numbers which would lose precision when converted to the `number` type.
   * 
   */
  parseNumbers?: boolean,

  /**
   * ### Basic events
   * 
   * The basic usage of `JsonHigh` involves 4 event handlers without arguments which indicate start and end of structures:
   */

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
   * And 2 event handlers with one argument which capture primitives:
   */

  /**
   * An object's key ended. 
   * 
   * The argument of the handler contains the key as a JavaScript string.
   * 
   * This event can be suppressed by setting [`maxStringBufferLength`](#maxStringBufferLength).
   */
  key?: (key: string) => Feedback,

  /**
   * A primitive JSON value ended. 
   * 
   * The argument of the event contains the corresponding JavaScript value: `true`, `false`, `null`, a number, or a string.
   * 
   * This event can be suppressed for strings if [`maxStringBufferLength`](#maxStringBufferLength) is set and for numbers if [`parseNumbers`](#parseNumbers) is set to `false`.
   */
  value?: (value: string | number | null | boolean) => Feedback,

  /**
   * Finally, there is the argumentless `end` event handler:
   */

  /**
   * Called by the `end` method of the stream to confirm that the parsed JSON document is complete and valid.
   */
  end?: () => End,

  /**
   * ### Extra events
   * 
   * These handlers take no arguments.
   */

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
   * ### Conditional events
   * 
   * These handlers take no arguments:
   */

  /**
   * A key ended (`"`).
   * 
   * Called instead of the `key` event **when `maxStringBufferLength` is set**.
   */
  closeKey?: JsonHighHandler<Feedback>,

  /**
   * A string value ended (`"`).
   * 
   * Called instead of the `value` event **when `maxStringBufferLength` is set**.
   */
  closeString?: JsonHighHandler<Feedback>,

  /**
   * These handlers receive the buffer that should be consumed:
   */

  /**
   * Key buffer is ready for consumption.
   * 
   * Called instead of the `key` event **when `maxStringBufferLength` is set**.
   * 
   * The `buffer` then contains `maxStringBufferLength` code points or possibly less if we reached the end of a key.
   */
  bufferKey?: (buffer: string) => Feedback,

  /**
   * String buffer is ready for consumption.
   *
   * For string values, called instead of the `value` event **when `maxStringBufferLength` is set**.
   *
   * The buffer then contains `maxStringBufferLength` code points or possibly less if we reached the end of a string value.
   */
  bufferString?: (buffer: string) => Feedback,

  /**
   * Number buffer is ready for consumption.
   * 
   * For number values, called instead of the `value` event **when `parseNumbers` is set**.
   * 
   * The buffer then contains the unparsed number (represented as a string).
   */
  bufferNumber?: (buffer: string) => Feedback,
}
export type JsonHighHandler<Feedback> = () => Feedback