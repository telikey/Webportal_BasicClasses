import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfig } from "@basicClasses/appConfig/appConfig";
import _ from "lodash";
import { map, Observable } from "rxjs";
import { TokenService } from "../token/tokenService";
import { ApiAction } from "./action/apiAction";
import { ApiActionGet } from "./action/apiActionGet";
import { ApiActionPost } from "./action/apiActionPost";
import { ApiSpecification } from "./apiSpecification";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private static CONTENT_TYPE = "Content-Type";
  private static APPLICATION_JSON = "application/json";

  static api_prefix = "webapi";

  constructor(private http: HttpClient, private token: TokenService) {}

  async call<TRequest, TResult>(
    specificationFn: (spec: ApiSpecification) => ApiAction<TRequest, TResult>
  ): Promise<TResult> {
    if (!_.isFunction(specificationFn)) {
      return undefined;
    }

    const spec = specificationFn(ApiSpecification.instance);

    const result = await this.callImplicit$(spec).toPromise();
    return result;
  }

  call$<TRequest, TResult>(
    specificationFn: (spec: ApiSpecification) => ApiAction<TRequest, TResult>
  ): Observable<TResult> {
    if (!_.isFunction(specificationFn)) {
      return undefined;
    }

    const spec = specificationFn(ApiSpecification.instance);

    const result = this.callInternal$(spec);
    return result;
  }

  callImplicit$<TRequest, TResult>(
    spec: ApiAction<TRequest, TResult>
  ): Observable<TResult> {
    const result = this.callInternal$(spec);
    return result;
  }

  private getUrl(action: { controller: string; action: string }): string {
    return ApiService_getUrl(action);
  }

  private getHeaders(
    action: { customHeaders?: HttpHeaders; request?: any },
    isPost: boolean
  ): HttpHeaders {
    let result: HttpHeaders =
      _.isNil(action) || _.isNil(action.customHeaders)
        ? new HttpHeaders()
        : action.customHeaders;

    if (!result.has(TokenService.SV_TOKEN)) {
      const token = this.token.get();

      if (!_.isNil(token) && token !== JSON.stringify(undefined)) {
        // freaky immutable hack, see: https://stackoverflow.com/a/45286959
        result = result.set(TokenService.SV_TOKEN, token);
      }
    }
    if (
      isPost &&
      _.isNil(action.request) &&
      !result.has(ApiService.CONTENT_TYPE)
    ) {
      result = result.set(ApiService.CONTENT_TYPE, ApiService.APPLICATION_JSON);
    }

    return result;
  }

  private callInternal$<TRequest, TResult>(
    action: ApiAction<TRequest, TResult>
  ): Observable<TResult> {
    if (_.isNil(action)) {
      return undefined;
    }

    if (action.isGet()) {
      const result = this.get$(action);
      return result;
    } else if (action.isPost()) {
      const result = this.post$(action);
      return result;
    }

    return undefined;
  }

  private get$<TResult>(action: ApiActionGet<TResult>): Observable<TResult> {
    const url = this.getUrl(action);

    const options = {
      headers: this.getHeaders(action, true),
      reportProgress: action.options.reportProgress,
      params: _.isFunction(action.convertRequest)
        ? action.convertRequest(action.request)
        : action.request,
    };
    options["responseType"] = action.options.responseType || ResponseType.Json;

    let result: Observable<TResult>;

    if (_.isFunction(action.convertResponse)) {
      const preResult = this.http.get<any>(url, options);
      result = preResult.pipe(map((x) => action.convertResponse(x)));
    } else {
      result = this.http.get<TResult>(url, options);
    }

    return result;
  }

  private post$<TRequest, TResult>(
    action: ApiActionPost<TRequest, TResult>
  ): Observable<TResult> {
    const url = this.getUrl(action);

    const body = _.isFunction(action.convertRequest)
      ? action.convertRequest(action.request)
      : action.request;

    const options = {
      headers: this.getHeaders(action, true),
      reportProgress: action.options.reportProgress,
    };
    options["responseType"] = action.options.responseType || ResponseType.Json;

    let result: Observable<TResult>;
    if (_.isFunction(action.convertResponse)) {
      const preResult = this.http.post<any>(url, body, options);
      result = preResult.pipe(map((x) => action.convertResponse(x)));
    } else {
      result = this.http.post<TResult>(url, body, options);
    }

    return result;
  }
}

export const enum ResponseType {
  Json = "json",
  Blob = "blob",
  Text = "text",
}

export function ApiService_getUrl(action: {
  controller: string;
  action: string;
  id?: number;
}): string {
  const host = AppConfig.config.apiUrl;
  let url = UrlHelper_combineWith(
    host,
    ApiService.api_prefix,
    action.controller,
    action.action
  );

  if (action?.id) {
    url = ensureParamsReady(url);

    url += `id=${action?.id}`;
  }

  return url;
}

export function ApiService_getUrlWithToken(
  action: { controller: string; action: string; id?: number },
  svToken: string
): string {
  const host = AppConfig.config.apiUrl;
  let url = UrlHelper_combineWith(
    host,
    ApiService.api_prefix,
    action.controller,
    action.action
  );

  if (svToken) {
    url = ensureParamsReady(url);

    url += `${TokenService.SV_TOKEN}=${encodeURIComponent(svToken)}`;
  }

  if (action?.id) {
    url = ensureParamsReady(url);

    url += `id=${action?.id}`;
  }

  return url;
}

function ensureParamsReady(url: string) {
  if (url.endsWith("/")) {
    url = url.substring(0, url.length - 2);
  }

  if (!_.includes(url, "?")) {
    url += "?";
  } else {
    url += "&";
  }

  return url;
}

export function UrlHelper_combineWith(
  host: string,
  ...paths: string[]
): string {
  if (host.endsWith("/")) {
    host = host.substring(0, host.length - 1);
  }

  const path = combineInternal(...paths);
  const result = `${host}${path}`;
  return result;
}

function combineInternal(...paths: string[]): string {
  const result = _(paths).reduce(
    (preResult: string, part: string) => preResult + preparePath(part),
    ""
  );
  return result;
}

function preparePath(path: string): string {
  if (!path) {
    return "";
  }

  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  if (!path.endsWith("/")) {
    path = path.substring(0, path.length);
  }

  return path;
}
