import { HttpParams } from '@angular/common/http';
import { ResponseType } from '../apiService';
import { ApiAction } from './apiAction';
export class ApiActionGet<TResult = void> extends ApiAction<
  HttpParams,
  TResult
> {
  constructor(responseType?: ResponseType) {
    super('get', responseType);
  }
}
