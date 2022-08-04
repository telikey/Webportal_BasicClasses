import {
  AfterContentInit,
  AfterViewInit,
  Directive,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { AppConfig } from "@basicClasses/appConfig/appConfig";
import { Dictionary } from "@basicClasses/dictionary/dictionary";
import { Logger } from "@basicClasses/logger/logger";
import { MetricStorage } from "@basicClasses/metricStorage/metricStorage";
import { nameOf, NameOfOptions } from "@basicClasses/nameOf/nameOf";
import { Guid } from "guid-typescript";
import _, { each } from "lodash";
import { IDisposable } from "./primitives/IDisposable";

@Directive()
export class ComponentBase
  implements
    OnInit,
    OnDestroy,
    OnChanges,
    IDisposable,
    AfterContentInit,
    AfterViewInit
{
  protected logger: Logger;
  protected metrics: MetricStorage<this>;
  protected _disposed = false;

  private readonly lazyRegistrations = new Dictionary<any>();

  guid: Guid;
  id: string;

  constructor() {
    this.guid = Guid.create();

    this.id = AppConfig.config.production
      ? `c_${this.guid.toString()}`
      : `${this.constructor.name}_${this.guid.toString()}`;

    this.logger = new Logger(this.constructor.name);
    this.metrics = new MetricStorage(this);
  }

  ngOnInit() {
    this._onInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._disposed) {
      return;
    }

    this._onChanges(changes);
  }

  ngAfterContentInit() {
    this._afterContentInit();
  }

  ngAfterViewInit() {
    this._afterViewInit();
  }

  ngOnDestroy() {
    this.dispose();
  }

  dispose() {
    this._disposed = true;

    this._onDestroy();

    if (this.logger) {
      delete this.logger;
    }

    if (this.metrics) {
      this.metrics.dispose();
      delete this.metrics;
    }
  }

  protected _onInit() {}
  protected _onDestroy() {
    this.lazyRegistrations.clear();
  }
  protected _afterContentInit() {}
  protected _afterViewInit() {}
  protected _onChanges(changes: SimpleChanges) {
    // tslint:disable-next-line: no-unused-expression
    changes;
  }

  protected _lazy<T1, T2 = this>(
    arg: string | ((obj: T2) => any),
    valueFactory: () => T1
  ): T1 {
    let key: string;
    if (_.isString(arg)) {
      key = arg;
    } else {
      key = this._nameOf(arg);
    }

    let value = this.lazyRegistrations.get(key);
    if (!value) {
      value = valueFactory();
      this.lazyRegistrations.set(key, value);
    }

    return value;
  }

  protected _lazyRemoveKeys<T = this>(
    ...args: (string | ((obj: T) => any))[]
  ): void {
    each(args, (arg) => {
      let key: string;
      if (_.isString(arg)) {
        key = arg;
      } else {
        key = this._nameOf(arg);
      }

      this.lazyRegistrations.remove(key);
    });
  }

  protected _lazyRemoveAll(): void {
    this.lazyRegistrations.clear();
  }

  protected _nameOf<T = this>(
    selector: (obj: T) => any,
    options?: NameOfOptions
  ): string {
    return nameOf.nameOf<T>(selector, options);
  }
}
