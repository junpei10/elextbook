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
  fragmentObservable: ActivatedRoute['fragment'];

  private _navigate: Router['navigate'];

  get value(): string {
    // @ts-ignore
    return this.fragmentObservable._value;
  }

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

  observe(name: string, config: ObserveConfig = {}): Subscription {
    let isMatching: boolean;
    const observable = config.observable || this.fragmentObservable;
    const subscription = observable
      .subscribe((currentFragment) => {
        // currentFragment = currentFragment || null; // currentFragmentがundefinedだった場合、nullに変換する(統一させる)
        if (currentFragment === name) {
          config.onMatch?.();
          isMatching = true;
        } else if (isMatching) {
          config.onEndMatching?.();
          isMatching = false;
        }
        // } else if (this._previousFragment === currentFragment) {
        //   config.elseEvent?.();
        //   if (config.autoUnsubscribe) {
        //     subscription.unsubscribe();
        //   }

        // } else {
        //   this._previousFragment = currentFragment;
        // }
      });

    return subscription;
  }

}
