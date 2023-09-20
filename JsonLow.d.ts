export declare const CodePoint: CodePoint
export type CodePoint = {
  _0_: number,
  _1_: number,
  _9_: number,
  _a_: number,
  _f_: number,
  _A_: number,
  _F_: number,
  _openCurly_: number,
  _openSquare_: number,
  _closeCurly_: number,
  _closeSquare_: number,
  _quoteMark_: number,
  _plus_: number,
  _minus_: number,
  _space_: number,
  _newline_: number,
  _tab_: number,
  _return_: number,
  _backslash_: number,
  _slash_: number,
  _comma_: number,
  _colon_: number,
  _t_: number,
  _n_: number,
  _b_: number,
  _r_: number,
  _u_: number,
  _dot_: number,
  _e_: number,
  _E_: number,
  _l_: number,
  _s_: number,
}
export enum JsonFeedbackType {
  error = 'JsonFeedbackType.error',
}
export enum JsonErrorType {
  unexpected = 'JsonErrorType.unexpected',
  unexpectedEnd = 'JsonErrorType.unexpectedEnd',
}
export declare const error: error
export type error = (message: string) => {
  type: JsonFeedbackType.error,
  message: string,
}
export declare const unexpected: unexpected
export type unexpected = (code: number, context: string, expected: Array<string | [startChar: string, endChar: string]>) => {
  type: JsonFeedbackType.error,
  errorType: JsonErrorType.unexpected,
  codePoint: number,
  context: string,
  expected: Array<string | [startChar: string, endChar: string]>,
}
export declare const unexpectedEnd: unexpectedEnd
export type unexpectedEnd = (context?: string, expected?: Array<string | [startChar: string, endChar: string]>) => {
  type: JsonFeedbackType.error,
  errorType: JsonErrorType.unexpectedEnd,
  context?: string,
  expected?: Array<string | [startChar: string, endChar: string]>,
}
export declare const isZeroNine: isZeroNine
export type isZeroNine = (code: number) => boolean
export declare const isOneNine: isOneNine
export type isOneNine = (code: number) => boolean
export declare const isWhitespace: isWhitespace
export type isWhitespace = (code: number) => boolean
export interface JsonLowBaseState {
  mode: string,
  parents: string[],
  isKey: boolean,
  hexIndex: number,
  maxDepth: number,
}
export interface JsonLowState extends JsonLowBaseState {
  downstream?: JsonLowState,
}
export interface JsonLowInitialState extends Partial<JsonLowBaseState> {
}
export declare const JsonLow: JsonLow
export type JsonLow = <Feedback, End>(
  next: JsonLowHandlers<Feedback, End>,
  initialState?: JsonLowInitialState,
) => {
  codePoint(codePoint: number): Feedback,
  end(): End,
  state(): JsonLowState,
}
export type JsonLowHandlers<Feedback, End> = {
  openObject?: JsonLowHandler<Feedback>,
  openArray?: JsonLowHandler<Feedback>,
  openString?: JsonLowHandler<Feedback>,
  openNumber?: JsonLowHandler<Feedback>,
  openTrue?: JsonLowHandler<Feedback>,
  openFalse?: JsonLowHandler<Feedback>,
  openNull?: JsonLowHandler<Feedback>,
  closeObject?: JsonLowHandler<Feedback>,
  closeArray?: JsonLowHandler<Feedback>,
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

  state?: () => JsonLowState,
  end?: () => End,
}
export type JsonLowHandler<Feedback> = (codePoint: number) => Feedback