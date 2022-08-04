import { SimpleChange, SimpleChanges } from "@angular/core";
import { nameOf } from "@basicClasses/nameOf/nameOf";
import _ from "lodash";

export module simpleChangesHelper {
  export function wrap<T>(
    context: T,
    changes: SimpleChanges
  ): SimpleChangesWrapper<T> {
    // tslint:disable-next-line: no-use-before-declare
    const wrapped = new SimpleChangesWrapper(context, changes);
    return wrapped;
  }
}

export class SimpleChangesWrapper<T> {
  /**
   *
   */
  constructor(private context: T, private changes: SimpleChanges) {}

  any(...selectors: ((x: T) => any)[]): boolean {
    const intercection = this.base(selectors, true);
    return intercection;
  }

  all(...selectors: ((x: T) => any)[]): boolean {
    const intercection = this.base(selectors, false);
    return intercection;
  }

  previous<TValue>(selector: (x: T) => TValue): TValue {
    const keys = nameOf.froms(this.context, selector);

    if (!_.some(keys)) {
      return undefined;
    }

    const headKey = _.head(keys);

    const change: SimpleChange = this.changes[headKey] as SimpleChange;

    return change.previousValue as TValue;
  }

  private base(selectors: ((x: T) => any)[], any: boolean): boolean {
    const triggers = _.keys(this.changes);

    const compacted = _(selectors)
      .filter((x) => _.isFunction(x))
      .compact()
      .value();

    const watched = nameOf.froms(this.context, ...compacted);

    if (any) {
      const anyResult = _.some(triggers, (x) => _.includes(watched, x));
      return anyResult;
    }

    const allResult = !_(watched).xor(triggers).some();
    return allResult;
  }
}
