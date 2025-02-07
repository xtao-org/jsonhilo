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
  openArray?: JsonHighHandler<Feedback>,
  openObject?: JsonHighHandler<Feedback>,
  closeArray?: JsonHighHandler<Feedback>,
  closeObject?: JsonHighHandler<Feedback>,
  key?: (key: string) => Feedback,
  value?: (value: string | number | null | boolean) => Feedback,
  end?: () => End,
}
export type JsonHighHandler<Feedback> = () => Feedback