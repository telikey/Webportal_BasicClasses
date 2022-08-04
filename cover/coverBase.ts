import * as _ from "lodash";

export type TypeWithFunction<T> = {
  [P in keyof T]?: (x?: T[P]) => T[P];
};

export class CoverBase {
  $depth = 0;

  $stack = [];

  /* Use it for public usage */
  override(x: TypeWithFunction<this>) {
    return this._override<this>(x);
  }

  protected _override<T extends CoverBase>(x: TypeWithFunction<T>) {
    const thisAsT = this as unknown as T;
    const result = this.__override<T>(thisAsT, x);

    result.$depth += 1;

    return result;
  }

  protected __override<T>(from: T, x: TypeWithFunction<T>) {
    const result = _.clone(from);

    _.forOwn(x, (overrideFn, key) => {
      if (_.isFunction(overrideFn)) {
        const originalObj = from[key];
        result[key] = overrideFn(originalObj);
      }
    });

    return result;
  }
}
