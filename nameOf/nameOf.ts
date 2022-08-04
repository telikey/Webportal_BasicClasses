import { nameof as outerNameOf } from "ts-simple-nameof";

export interface NameOfOptions {
  lastProp?: boolean;
}

export module nameOf {
  export function from<T extends Object>(
    _anchorObj: T,
    selector: (x: T) => any
  ): string {
    return outerNameOf<T>(selector);
  }

  export function froms<T extends Object>(
    _anchorObj: T,
    ...selectors: ((x: T) => any)[]
  ): string[] {
    if (selectors) {
      return selectors.map((x) => outerNameOf(x));
    }

    return [];
  }

  export function _<T extends Object>(selector: (x: T) => any): string {
    return from<T>(undefined, selector);
  }

  export function nameOf<T>(
    selector: (obj: T) => any,
    options?: NameOfOptions
  ): string {
    return outerNameOf<T>(selector, options);
  }
}
