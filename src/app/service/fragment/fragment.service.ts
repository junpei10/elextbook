import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

interface ObserveConfig {
  onMatch?: () => any;
  onEndMatching?: () => any;
  autoUnsubscribe?: boolean;
  observable?: Observable<any>;
}

@Injectable({
  providedIn: 'root'
})
export class Fragment {
  readonly fragmentObservable: ActivatedRoute['fragment'];

  get value(): string {
    // @ts-ignore
    return this.fragmentObservable._value;
  }

  private _navigate: Router['navigate'];

  constructor(
    _router: Router,
    _route: ActivatedRoute
  ) {
    this.fragmentObservable = _route.fragment;
    this._navigate = _router.navigate.bind(_router);
  }

  add(name: string): void {
    this._navigate([], { fragment: name });
  }

  remove(): void {
    if (this.value) {
      history.back();
    }
  }

  observe(name: string, config: ObserveConfig = {}): Subscription {
    let isMatching: boolean;
    const observable = config.observable || this.fragmentObservable;
    const subscription = observable
      .subscribe((currFragName) => {
        if (currFragName === name) {
          config.onMatch?.();
          isMatching = true;

        } else if (isMatching) {
          config.onEndMatching?.();
          isMatching = false;
        }
      });

    return subscription;
  }
}
