import { EventEmitter } from "@angular/core";
import { IDisposable } from "@basicClasses/contexts/primitives/IDisposable";
import _ from "lodash";
import { Observable, Subscription } from "rxjs";

export class SubBag implements IDisposable {
  private namedSubs: {
    [key: string]: Subscription;
  } = {};

  private subs: Subscription[] = [];

  public unsubscribe(name: string): void {
    if (name && this.namedSubs[name]) {
      this.namedSubs[name].unsubscribe();
      delete this.namedSubs[name];
    }
  }

  public subscribe<T>(
    name: string,
    emitter: EventEmitter<T> | Observable<T>,
    action?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription {
    if (_.isNil(emitter)) {
      return;
    }

    if (_.isNil(name)) {
      this._subscribeInternal(emitter, action);
      return;
    }

    const prevSub = this.namedSubs[name];

    if (!_.isNil(prevSub)) {
      prevSub.unsubscribe();
      delete this.namedSubs[name];
    }

    const nextAction = _.isFunction(action) ? (v: T) => action(v) : undefined;
    const errorAction = _.isFunction(error)
      ? (err: any) => error(err)
      : undefined;
    const completeAction = _.isFunction(complete)
      ? () => complete()
      : undefined;

    const sub = emitter.subscribe(nextAction, errorAction, completeAction);
    this.namedSubs[name] = sub;
    return sub;
  }

  public add(subscription: Subscription) {
    this.subs.push(subscription);
  }

  public addNamed(name: string, subscription: Subscription) {
    this.unsubscribe(name);

    this.namedSubs[name] = subscription;
  }

  public dispose(): void {
    if (_.some(this.subs)) {
      _.each(this.subs, (s) => s.unsubscribe());
      this.subs.length = 0;
    }

    if (_.some(this.namedSubs)) {
      _.each(this.namedSubs, (s) => s.unsubscribe());
      this.namedSubs = {};
    }
  }

  private _subscribeInternal<T>(
    emitter: EventEmitter<T> | Observable<T>,
    action: (value: T) => void
  ): void {
    if (_.isNil(emitter)) {
      return;
    }

    const sub = emitter.subscribe((v: T) => {
      if (_.isFunction(action)) {
        action(v);
      }
    });
    this.subs.push(sub);
  }
}
