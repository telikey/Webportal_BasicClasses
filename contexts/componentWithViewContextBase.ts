import { Directive, Input } from "@angular/core";
import { nameOf } from "@basicClasses/nameOf/nameOf";
import _ from "lodash";
import { Observable } from "rxjs";
import { ComponentWithSubscriptionsBase } from "./componentWithSubscriptionBase";

@Directive()
export class ComponentWithViewContextBase<
  TContext
> extends ComponentWithSubscriptionsBase {
  protected _viewContext: TContext;
  protected _viewContext$: Observable<TContext>;
  private waitContextPromiseResolver: () => void;

  constructor() {
    super();
  }

  public get viewContext(): TContext {
    return this._viewContext;
  }

  @Input() public set viewContext(v: TContext) {
    if (_.isFunction(this.waitContextPromiseResolver)) {
      this.waitContextPromiseResolver();
    }

    this.viewContextUpdated(v);
  }

  public get viewContext$(): Observable<TContext> {
    return this._viewContext$;
  }

  @Input() public set viewContext$(v: Observable<TContext>) {
    this._viewContext$ = v;

    this._onViewContext$Changed();

    this._subBag.subscribe(
      nameOf.nameOf<ComponentWithViewContextBase<TContext>>(
        (x) => x.viewContext$
      ),
      this._viewContext$,
      (context) => {
        this.viewContext = context;
      }
    );
  }

  protected _onViewContextChanged() {}

  protected _onViewContext$Changed() {}

  private viewContextUpdated(newContext: TContext) {
    this._viewContext = newContext;
    this._onViewContextChanged();
  }
}
