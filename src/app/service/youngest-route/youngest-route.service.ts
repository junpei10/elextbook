import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { RouteChanges, ROUTE_CHANGES } from '../route-observer';

export interface FlexibleActivatedRouteSnapshot<D> extends ActivatedRouteSnapshot {
  data: D;
}

@Injectable({
  providedIn: 'root'
})
export class YoungestRoute<D = unknown> {
  activatedRouteRef: ActivatedRoute;

  private _state: FlexibleActivatedRouteSnapshot<D>;
  get state(): FlexibleActivatedRouteSnapshot<D> {
    return this._state;
  }

  constructor(
    _route: ActivatedRoute,
    @Inject(ROUTE_CHANGES) routeChanges: RouteChanges
  ) {
    routeChanges.subscribe(() => {
      while (_route.firstChild) { _route = _route.firstChild; }
      this.activatedRouteRef = _route;
      this._state = _route.snapshot as any;
    });
  }
}
