import {
  Directive,
  EventEmitter,
  Input,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { SimpleChangesWrapper } from "@basicClasses/simpleChangesWrapper/simpleChangesWrapper";
import { SubBag } from "@basicClasses/subBag/subBag";
import _ from "lodash";
import { Observable, Subject, Subscription } from "rxjs";
import { ComponentBase } from "./componentBase";

@Directive()
export abstract class ComponentWithSubscriptionsBase extends ComponentBase {
  @Input() simpleChanges$: Observable<SimpleChanges>;

  constructor() {
    super();
    this._subBag = new SubBag();
  }

  protected readonly _subBag: SubBag;

  protected _subscribe<T>(
    selector: string | ((obj: this) => any),
    emitter: EventEmitter<T> | Observable<T>,
    action?: ((value: T) => void) | Subject<T>,
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription {
    const callback: (value: T) => void = action
      ? (x) => {
          if (_.isFunction(action)) {
            action(x);
            return;
          }

          const asSubj = action as Subject<T>;

          if (_.isFunction(asSubj.next)) {
            asSubj.next(x);
            return;
          }
        }
      : undefined;

    const errorCallback: (error: any) => void = error
      ? (x) => {
          if (_.isFunction(error)) {
            error(x);
            return;
          }
        }
      : undefined;

    const completeCallback: () => void = complete
      ? () => {
          if (_.isFunction(complete)) {
            complete();
            return;
          }
        }
      : undefined;

    const key = _.isFunction(selector) ? this._nameOf(selector) : selector;

    const result = this._subBag.subscribe(
      key,
      emitter,
      callback,
      errorCallback,
      completeCallback
    );
    return result;
  }

  protected _subscribeOnChange<T>(
    wrap: SimpleChangesWrapper<this>,
    selector: (obj: this) => Observable<T>,
    action?: ((value: T) => void) | Subject<T>,
    error?: (error: any) => void,
    complete?: () => void
  ) {
    if (!wrap || !selector) {
      return;
    }

    if (wrap.any(selector)) {
      const obs = selector(this);

      if (obs) {
        this._subscribe(selector, obs, action, error, complete);
      } else {
        this._unsubscribe(selector);
      }
    }
  }

  protected _unsubscribe(selector: string | ((obj: this) => any)) {
    const key = _.isFunction(selector) ? this._nameOf(selector) : selector;

    this._subBag.unsubscribe(key);
  }

  protected emulateNgOnChanges(simpleChanges: SimpleChanges) {
    const resultSimpleChanges: SimpleChanges = {};
    _.each(simpleChanges, (x, key) => {
      const previousValue = _.has(x, "previousValue")
        ? x.previousValue
        : _.get(this, key);
      const currentValue = x.currentValue;
      const firstChange = _.isNil(x.firstChange) ? true : x.firstChange;

      _.set(this, key, currentValue);
      resultSimpleChanges[key] = new SimpleChange(
        previousValue,
        currentValue,
        firstChange
      );
    });
    this._onChanges(resultSimpleChanges);
  }

  protected _onChanges(changes: SimpleChanges) {
    super._onChanges(changes);

    if (changes.simpleChanges$) {
      this.processSvSimpleChanges(changes);
    }
  }

  protected _onDestroy() {
    super._onDestroy();

    if (this._subBag) {
      this._subBag.dispose();
    }
  }

  private processSvSimpleChanges(changes: SimpleChanges) {
    // Если инициализируется как undefined, ничего не делаем
    if (
      changes.simpleChanges$.firstChange &&
      !changes.simpleChanges$.currentValue
    ) {
      return;
    }

    const subscriptionName = this._nameOf((x) => x.simpleChanges$);
    const simpleChanges$ = changes.simpleChanges$
      .currentValue as Observable<SimpleChanges>;

    if (simpleChanges$) {
      // Если simpleChanges$ задан, подписываемся на него и эмулируем запуски onChanges
      this._subBag.subscribe(
        subscriptionName,
        simpleChanges$,
        (simpleChanges) => this.emulateNgOnChanges(simpleChanges)
      );
    } else {
      // Если valueSimpleChange$ удаляется, отписываемся от него
      this._subBag.unsubscribe(subscriptionName);
    }
  }
}
