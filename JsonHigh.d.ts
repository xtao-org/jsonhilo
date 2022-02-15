export declare const JsonHigh: JsonHigh
export type JsonHigh = <Feedback, End>(
  next: JsonHighHandlers<Feedback, End>,
) => {
  chunk(chunk: string): Feedback,
  end(): End,
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