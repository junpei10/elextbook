import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { RouteChanges, ROUTE_CHANGES } from '../route-observer';

export interface FlexibleActivatedRoute<D> extends ActivatedRouteSnapshot {
  data: D;
}

@Injectable({
  providedIn: 'root'
})
export class YoungestRoute<D = unknown> {
  readonly activatedRouteRef: ActivatedRoute;

  readonly state: FlexibleActivatedRoute<D>;

  constructor(
    _route: ActivatedRoute,
    @Inject(ROUTE_CHANGES) routeChanges: RouteChanges
  ) {
    routeChanges.subscribe(() => {
      let route = _route;

      while (route.firstChild) { route = route.firstChild; }

      // @ts-ignore: assign the readonly variable
      this.activatedRouteRef = route;

      // @ts-ignore: assign the readonly variable
      this.state = route.snapshot as any;
    });
  }
}
