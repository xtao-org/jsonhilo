export declare const CodePoint: {
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
export interface JsonErrorFeedback {
  type: JsonFeedbackType.error,
  message: string,
}
export interface JsonUnexpectedFeedback {
  type: JsonFeedbackType.error,
  errorType: JsonErrorType.unexpected,
  codePoint: number,
  context: string,
  expected: Array<string | [startChar: string, endChar: string]>,
}
export interface JsonUnexpectedEndFeedback {
  type: JsonFeedbackType.error,
  errorType: JsonErrorType.unexpectedEnd,
  context?: string,
  expected?: Array<string | [startChar: string, endChar: string]>,
}
export type JsonStandardFeedback = JsonErrorFeedback | JsonUnexpectedFeedback;
export type JsonStandardEnd = JsonErrorFeedback | JsonUnexpectedEndFeedback;
export declare const error: (message: string) => JsonErrorFeedback
export declare const isError: (message: unknown) => boolean
export declare const unexpected: (code: number, context: string, expected: Array<string | [startChar: string, endChar: string]>) => JsonUnexpectedFeedback
export declare const unexpectedEnd: (context?: string, expected?: Array<string | [startChar: string, endChar: string]>) => JsonUnexpectedEndFeedback
export declare const isZeroNine: (code: number) => boolean
export declare const isOneNine: (code: number) => boolean
export declare const isWhitespace: (code: number) => boolean
export interface JsonLowBaseConfig {
  maxDepth: number,
}
export interface JsonLowConfig<DownstreamConfig = unknown> extends JsonLowBaseConfig {
  downstream?: DownstreamConfig,
}
export interface JsonLowBaseState {
  mode: string,
  parents: string[],
  isKey: boolean,
  hexIndex: number,
}
export interface JsonLowState<DownstreamState = unknown> extends JsonLowBaseState {
  downstream?: DownstreamState,
}
export interface JsonLowInitialState extends Partial<JsonLowBaseState>, Partial<JsonLowBaseConfig> {
}
export declare const JsonLow: <Feedback, End, DownstreamState = unknown, DownstreamConfig = unknown>(
  next: JsonLowHandlers<Feedback, End>,
  initialState?: JsonLowInitialState,
) => {
  codePoint(codePoint: number): Feedback | JsonStandardFeedback | undefined,
  end(): End | JsonStandardEnd | undefined,
  depth(): number,
  state(): JsonLowState<DownstreamState>,
  config(): JsonLowConfig<DownstreamConfig>,
}
export type JsonLowHandlers<Feedback, End, DownstreamState = unknown, DownstreamConfig = unknown> = {
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

  state?: () => JsonLowState<DownstreamState>,
  config?: () => JsonLowConfig<DownstreamConfig>,
  end?: () => End,
}
export type JsonLowHandler<Feedback> = (codePoint: number) => Feedback