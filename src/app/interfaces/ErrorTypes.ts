export interface TErrorSource {
  path: string;
  message: string;
}

export interface TGenericErrorTypes {
  status:  number;
  message: string;
  errorSource: TErrorSource[];
}