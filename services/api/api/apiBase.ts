import { HttpParams } from '@angular/common/http';
import { ApiActionGet } from '../action/apiActionGet';
import { ApiActionPost } from '../action/apiActionPost';
import { ResponseType } from '../apiService';

export class ApiBase {
  private _controllerName = 'baseapi';
  protected get controllerName(): string {
    return this._controllerName;
  }
  protected set controllerName(value: string) {
    throw new Error('Controller name can be set only in constructor!');
  }

  constructor(controllerName: string) {
    this._controllerName = controllerName;
  }

  protected apiGet<TResult>(
    action: string,
    params?: HttpParams,
    responseType?: ResponseType
  ): ApiActionGet<TResult> {
    const result = new ApiActionGet<TResult>(responseType);

    result.controller = this.controllerName;
    result.action = action;
    result.request = params;

    return result;
  }

  protected apiPost<TRequest, TResult>(
    action: string,
    request: TRequest,
    responseType?: ResponseType
  ): ApiActionPost<TRequest, TResult> {
    {
      const result = new ApiActionPost<TRequest, TResult>(responseType);

      result.controller = this.controllerName;
      result.action = action;
      result.request = request;

      return result;
    }
  }
}
