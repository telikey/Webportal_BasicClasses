import _ from "lodash";
import { IDictionary } from "./IDictionary";

export class Dictionary<TValue> implements IDictionary<string, TValue> {
  private internalDict: { [key in string]?: TValue };

  public constructor() {
    this.internalDict = {};
  }

  public static fromObject<TValue>(obj: any): Dictionary<TValue> {
    const result = new Dictionary<TValue>();

    _.each(obj, (value, key) => {
      result.set(key, value as TValue);
    });

    return result;
  }

  public getKeys(): string[] {
    const keys = _.keys(this.internalDict);
    return keys;
  }

  public getValues(): TValue[] {
    const vals: TValue[] = _.values(this.internalDict);
    return vals;
  }

  public get(key: string): TValue {
    const v = this.internalDict[key];
    return this.exists(v) ? v : undefined;
  }

  public remove(key: string): void {
    const v = this.internalDict[key];
    if (this.exists(v)) {
      delete this.internalDict[key];
    }
  }

  public clear() {
    this.internalDict = {};
  }

  public set(key: string, val: TValue): void {
    this.internalDict[key] = val;
  }

  public count(): number {
    return _.keys(this.internalDict).length;
  }

  public toObject(): any {
    const copy = JSON.parse(JSON.stringify(this.internalDict));
    return copy;
  }

  private exists(v: TValue | undefined): v is TValue {
    const result = _.isNil(v);
    return !result;
  }
}
