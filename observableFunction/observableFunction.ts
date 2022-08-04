import { Observable } from "rxjs";

export class ObservableFunction<TParams = any, TResult = any> {
  private _func: (params: TParams) => Observable<TResult>;

  constructor(func: (params: TParams) => Observable<TResult>) {
    this._func = func;
  }

  get func(): (params: TParams) => Observable<TResult> {
    return this._func;
  }

  exec(params?: TParams): Observable<TResult> {
    return this._func(params);
  }
}
