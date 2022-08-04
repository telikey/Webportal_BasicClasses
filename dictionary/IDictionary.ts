export interface IDictionary<TKey, TValue> {
  getKeys(): TKey[];
  getValues(): TValue[];
  get(key: TKey): TValue | undefined;
  set(key: TKey, val: TValue): void;
  count(): number;
}
