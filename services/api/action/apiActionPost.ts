import { ResponseType } from '../apiService';
import { ApiAction } from './apiAction';
export class ApiActionPost<TRequest, TResult = void> extends ApiAction<
  TRequest,
  TResult
> {
  constructor(responseType?: ResponseType) {
    super('post', responseType);
  }
}
