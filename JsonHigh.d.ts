export declare const JsonHigh: JsonHigh
export type JsonHigh = <Feedback, End>(
  next: JsonHighHandlers<Feedback, End>,
) => {
  push(chunk: string): Feedback,
  end(): End,
}
export type JsonHighHandlers<Feedback, End> = {
  openArray?: (depth: number) => Feedback,
  openObject?: (depth: number) => Feedback,
  closeArray?: (depth: number) => Feedback,
  closeObject?: (depth: number) => Feedback,
  key?: (key: string) => Feedback,
  value?: (value: string | number | null | boolean) => Feedback,
  end?: () => End,
}
export type JsonHighHandler<Feedback> = () => Feedback