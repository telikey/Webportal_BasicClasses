import { AppConfig } from "@basicClasses/appConfig/appConfig";
import { Logger } from "@basicClasses/logger/logger";
import { nameOf } from "@basicClasses/nameOf/nameOf";
import { each, filter, find, isString, keys, map, zipObject } from "lodash";
import { IMetricStorage } from "./IMetricStorage";
import { Counter, Metric, MetricLevel, Timer } from "./metric";

export class MetricStorage<TComponent extends Object>
  implements IMetricStorage
{
  /**
   *
   */
  constructor(from: string | { constructor: { name: string } }) {
    this.name = isString(from) ? from : from.constructor.name;

    if (AppConfig.config.metricsEnabled) {
      MetricsInterface.add(this);
    }
  }

  private metrics: { [key: string]: Metric } = {};

  name: string;

  increase(selector: (obj: TComponent) => any) {
    this.counter(nameOf.nameOf<TComponent>(selector)).increase();
  }

  counter(name: string, boundaries?: { min?: number; max?: number }): Counter {
    if (this.metrics[name]) {
      return this.metrics[name] as Counter;
    }

    const metric = new Counter(this, name, boundaries);
    this.metrics[name] = metric;
    return metric;
  }

  timer(name: string, boundaries?: { min?: number; max?: number }): Timer {
    if (this.metrics[name]) {
      return this.metrics[name] as Timer;
    }

    const metric = new Timer(this, name, boundaries);
    this.metrics[name] = metric;
    return metric;
  }

  updated(source: Metric) {
    if (source.level !== MetricLevel.Normal) {
      MetricsInterface.escalate(this, source);
    }
  }

  dispose(): void {
    if (AppConfig.config.metricsEnabled) {
      MetricsInterface.disposed(this);
    }
  }
}

export class MetricsInterface {
  private static _logger: Logger;

  private static get logger() {
    if (!MetricsInterface._logger) {
      MetricsInterface._logger = new Logger("Metrics");
    }

    return MetricsInterface._logger;
  }

  private static map: {
    [key: string]: {
      storage: MetricStorage<any>;
      created: Date;
      disposed?: Date;
      lifetimeMs?: number;
    }[];
  } = {};

  public static all() {
    return this.map;
  }

  public static find(search: string) {
    if (!search) {
      return this.all();
    }

    const filtered = this.findKeys(search);

    const result = zipObject(
      filtered,
      map(filtered, (n) => this.map[n])
    );
    return result;
  }

  public static add(storage: MetricStorage<any>) {
    if (!AppConfig.config.metricsEnabled) {
      return;
    }

    const name = storage.name;

    if (!this.map[name]) {
      this.map[name] = [];
    }

    this.map[name].push({
      created: new Date(),
      storage: storage,
    });
  }

  public static flush(search: string) {
    const names = search ? this.findKeys(search) : keys(this.map);

    const flushed: string[] = [];

    each(names, (key) => {
      flushed.push(key);
      delete this.map[key];
    });

    this.logger.info(`Flushed metrics: ${flushed.length}`, flushed);
  }

  public static escalate(storage: MetricStorage<any>, metric: Metric) {
    this.logger.warn(
      `[${storage.name}]: Metric level gone bad ${metric.name} (${metric.level})`,
      this,
      metric
    );
  }

  public static disposed(storage: MetricStorage<any>) {
    const storages = this.map[storage.name];
    const current = find(storages, (x) => x.storage === storage);
    current.disposed = new Date();
    current.lifetimeMs =
      current.disposed.getMilliseconds() - current.created.getMilliseconds();
  }

  private static findKeys(search: string) {
    const lowered = search.toLowerCase();

    const names = keys(this.map);
    const filtered = filter(names, (x) => {
      const found = x.toLowerCase().includes(lowered);
      return found;
    });

    return filtered;
  }
}
