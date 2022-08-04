import { isFunction, isNil, last } from "lodash";
import { IMetricStorage } from "./IMetricStorage";

export enum MetricLevel {
  /** Defalt level */
  Normal = 0,

  /** Abstractly bad value */
  Bad = 1,

  /** Bad in a low profile way, f.ex. Low speed, or parameter value */
  Bad_Low = 2,
  /** Bad in a hight profile way, f.ex. A lot of function calls or other */
  Bad_High = 3,

  /** Not bad, but close */
  Warn = 4,
}

export const NormalMetricLevel: MetricLevel = MetricLevel.Normal;

export class Metric<T = any> {
  /**
   *
   */
  constructor(
    private storage: IMetricStorage,
    public name: string,
    public type: string,
    private levelChanger?: (v: T) => MetricLevel
  ) {
    this.setLevel(NormalMetricLevel);
  }

  public value: T;
  public level: MetricLevel;
  public levelLog: { level: MetricLevel; date: Date }[] = [];

  protected update(exec: (v: T) => T) {
    this.value = exec(this.value);

    if (isFunction(this.levelChanger)) {
      const newLevel = this.levelChanger(this.value);
      this.setLevel(newLevel);
    }

    this.storage.updated(this);
  }

  private setLevel(newLevel: MetricLevel) {
    if (isNil(newLevel) || this.level === newLevel) {
      return;
    }

    this.level = newLevel;

    this.levelLog.push({
      date: new Date(),
      level: this.level,
    });
  }
}

export class Counter extends Metric<number> {
  public static readonly Type = "Counter";
  /**
   *
   */
  constructor(
    storage: IMetricStorage,
    name: string,
    boundaries?: {
      min?: number;
      max?: number;
    }
  ) {
    super(storage, name, Counter.Type, (v) => {
      if (!boundaries) {
        return undefined;
      }

      const maxOk = boundaries.max ? boundaries.max <= this.value : true;

      const minOk = boundaries.min ? boundaries.min >= this.value : true;

      if (maxOk && minOk) {
        return MetricLevel.Normal;
      }

      if (!maxOk && !minOk) {
        return MetricLevel.Bad;
      }

      if (!maxOk) {
        return MetricLevel.Bad_High;
      }

      if (!minOk) {
        return MetricLevel.Bad_Low;
      }
    });
    this.value = 0;
  }

  increase(count: number = 1) {
    this.update((v) => v + count);
  }

  decrease(count: number = 1) {
    this.update((v) => v - count);
  }
}

export interface TimerLog {
  start?: Date;
  end?: Date;
  durationMs?: number;
  error?: string;
}

export class Timer extends Metric<{ log: TimerLog[] }> {
  public static readonly Type = "Timer";
  /**
   *
   */
  constructor(
    storage: IMetricStorage,
    name: string,
    boundaries?: {
      min?: number;
      max?: number;
    }
  ) {
    super(storage, name, Timer.Type);

    this.value = {
      log: [],
    };
  }

  start() {
    this.update((v) => {
      v.log.push({
        start: new Date(),
      });

      return v;
    });
  }

  finish() {
    this.update((v) => {
      const l = last(v.log);

      if (!l) {
        v.log.push({});
      }

      l.end = new Date();

      if (!l.start) {
        l.error = "Start wasn't fired yet";
      } else {
        l.durationMs = l.end.getTime() - l.start.getTime();
      }

      return v;
    });
  }
}
