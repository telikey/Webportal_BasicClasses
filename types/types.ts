import _ from "lodash";
import { Subject } from "rxjs";

export module types {
  export function isType<T>(obj: any, checker: (src: T) => boolean): obj is T {
    const casted = obj as T;
    if (_.isNil(casted)) {
      return false;
    }
    const check = checker(casted);
    return check;
  }

  export function isSubject<T>(obj: any): obj is Subject<T> {
    const check =
      obj && isType(obj, (src: Subject<T>) => _.isFunction(src.next));
    return check;
  }
}
