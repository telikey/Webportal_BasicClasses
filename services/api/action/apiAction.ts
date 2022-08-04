import { HttpHeaders } from '@angular/common/http';
import { ResponseType } from '../apiService';
import { ApiActionGet } from './apiActionGet';
import { ApiActionPost } from './apiActionPost';

export abstract class ApiAction<TRequest, TResult> {
  private type: string;

  constructor(type: 'get' | 'post', responseType?: ResponseType) {
    this.type = type;
    this.options = {
      responseType: responseType,
    };
  }

  public controller: string;

  public action: string;

  public request?: TRequest;

  public options?: {
    reportProgress?: boolean;
    responseType?: ResponseType;
  };

  public customHeaders?: HttpHeaders;

  public convertRequest?: (request: TRequest) => any;

  public convertResponse?: (response: any) => TResult;

  public isGet(): this is ApiActionGet<TResult> {
    const result = this.type === 'get';
    return result;
  }

  public isPost(): this is ApiActionPost<TRequest, TResult> {
    const result = this.type === 'post';
    return result;
  }
}
