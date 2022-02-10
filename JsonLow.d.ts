export declare const JsonLow: JsonLow
export type JsonLow = <Feedback, End>(
  next: JsonLowHandlers<Feedback, End>, 
  initialState?: {
    mode: string,
    parents: string[],
    hexIndex: number,
    maxDepth: number,
  }
) => {
  codePoint(codePoint: number): Feedback,
  end(): End,
  state(): string,
}
export type JsonLowHandlers<Feedback, End> = {
  openObject?: (codePoint: number, depth: number) => Feedback,
  openArray?: (codePoint: number, depth: number) => Feedback,
  openString?: JsonLowHandler<Feedback>,
  openNumber?: JsonLowHandler<Feedback>,
  openTrue?: JsonLowHandler<Feedback>,
  openFalse?: JsonLowHandler<Feedback>,
  openNull?: JsonLowHandler<Feedback>,
  closeObject?: (codePoint: number, depth: number) => Feedback,
  closeArray?: (codePoint: number, depth: number) => Feedback,
  closeString?: JsonLowHandler<Feedback>,
  // note: edge case with no codePoint or Feedback
  closeNumber?: () => void,
  closeTrue?: JsonLowHandler<Feedback>,
  closeFalse?: JsonLowHandler<Feedback>,
  closeNull?: JsonLowHandler<Feedback>,

  openKey?: JsonLowHandler<Feedback>,
  openHex?: JsonLowHandler<Feedback>,
  closeKey?: JsonLowHandler<Feedback>,
  closeHex?: JsonLowHandler<Feedback>,

  codePoint?: JsonLowHandler<Feedback>,
  escape?: JsonLowHandler<Feedback>,
  whitespace?: JsonLowHandler<Feedback>,
  comma?: JsonLowHandler<Feedback>,
  colon?: JsonLowHandler<Feedback>,

  state?: () => string,
  end?: () => End,
}
export type JsonLowHandler<Feedback> = (codePoint: number) => Feedback