import { types } from "@basicClasses/types/types";
import _ from "lodash";
import { isObservable, merge, NEVER, Observable } from "rxjs";
import { shareReplay, switchMap } from "rxjs/operators";

export class ObservableFunc<TParams = any, TResult = any> {
  private _func: (params: TParams) => Observable<TResult>;
  private _refreshObs: Observable<void>;

  constructor(
    func: (params: TParams) => Observable<TResult>,
    refreshObs?: Observable<void>
  ) {
    this._func = func;
    this._refreshObs = refreshObs || NEVER;
  }

  get func(): (params: TParams) => Observable<TResult> {
    return this._func;
  }

  get refresh$(): Observable<void> {
    return this._refreshObs;
  }

  exec(params?: TParams): Observable<TResult> {
    return this._func(params);
  }

  refresh(r?: TResult) {
    if (types.isSubject<TResult>(this._refreshObs)) {
      this._refreshObs.next(r);
    }
  }

  mergeRefresh(refresh$: Observable<void>) {
    if (refresh$) {
      this._refreshObs = merge(this._refreshObs, refresh$);
    }
    return this;
  }

  overrideParams<TNewParams>(
    overridenParamsFn: (p: TNewParams) => TParams | Observable<TParams>,
    refreshObs?: Observable<void>
  ): ObservableFunc<TNewParams, TResult> {
    return this.override<TNewParams, TResult>({
      params: overridenParamsFn,
      refresh: refreshObs,
    });
  }

  overrideResult<TNewResult>(
    pipeFn: (obs: Observable<TResult>) => Observable<TNewResult>,
    refreshObs?: Observable<void>
  ): ObservableFunc<TParams, TNewResult> {
    return this.override<TParams, TNewResult>({
      result: pipeFn,
      refresh: refreshObs,
    });
  }

  override<TNewParams, TNewResult>(
    overrideParams: OverrideFunctionParams<
      TNewParams,
      TParams,
      TResult,
      TNewResult
    >
  ): ObservableFunc<TNewParams, TNewResult> {
    const that = this;
    return new ObservableFunc<TNewParams, TNewResult>((p) => {
      let params: TParams;
      if (_.isFunction(overrideParams.params)) {
        const clonedParams = _.cloneDeep(p);
        const paramsResult = overrideParams.params(clonedParams);
        if (isObservable(paramsResult)) {
          return paramsResult.pipe(
            switchMap((x) => {
              const prevFuncRes = that.exec(x);
              if (_.isFunction(overrideParams.result)) {
                return overrideParams.result(prevFuncRes);
              } else {
                return prevFuncRes as unknown as Observable<TNewResult>;
              }
            })
          );
        } else {
          params = paramsResult;
        }
      } else {
        params = p as unknown as TParams;
      }

      const prevFuncResult = that.exec(params);
      if (_.isFunction(overrideParams.result)) {
        return overrideParams.result(prevFuncResult);
      } else {
        return prevFuncResult as unknown as Observable<TNewResult>;
      }
    }, that.getRefreshObs$(that._refreshObs, overrideParams.refresh));
  }

  cacheWithDueTime(
    lifetimeInMilliseconds: number = 500,
    enableDiagnosicLogs = false
  ): ObservableFunc<TParams, TResult> {
    const that = this;

    const cache: {
      [key: string]: {
        value: Observable<TResult>;
        addedTime: Date;
      };
    } = {};

    const writeLogIfNeed = (text: string) => {
      if (enableDiagnosicLogs) {
        console.log(text);
      }
    };

    return new ObservableFunc<TParams, TResult>((params) => {
      const key = JSON.stringify(params);

      let cacheAge;

      if (cache[key]) {
        cacheAge =
          new Date(Date.now()).getTime() - cache[key].addedTime.getTime();

        if (cacheAge > lifetimeInMilliseconds) {
          delete cache[key];
          cacheAge = undefined;
        }
      }

      if (!cache[key]) {
        writeLogIfNeed("add cache by key = " + key);

        cache[key] = {
          value: that.exec(params).pipe(shareReplay(1)),
          addedTime: new Date(Date.now()),
        };
      }

      writeLogIfNeed(
        cacheAge
          ? "get cache after " + cacheAge + " ms"
          : "get cache first time"
      );

      return cache[key].value;
    }, that._refreshObs);
  }

  private getRefreshObs$(
    funcRefresh$: Observable<void>,
    customRefresh$: Observable<void>
  ): Observable<void> {
    if (funcRefresh$ && customRefresh$) {
      return merge(funcRefresh$, customRefresh$);
    }

    if (customRefresh$) {
      return customRefresh$;
    }

    return funcRefresh$;
  }
}

export class OverrideFunctionParams<TNewParams, TParams, TResult, TNewResult> {
  params?: (p: TNewParams) => TParams | Observable<TParams>;
  result?: (r: Observable<TResult>) => Observable<TNewResult>;
  refresh?: Observable<void>;
}
