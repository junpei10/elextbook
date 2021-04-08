import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperatorFunction, Subscription } from 'rxjs';

interface ObserveConfig {
  onMatch?: () => any;
  onEndMatching?: () => any;
  pipeParams?: OperatorFunction<any, any>[];
}

@Injectable({
  providedIn: 'root'
})
export class Fragment {
  private _history = history;
  readonly observable: ActivatedRoute['fragment'];

  get value(): string {
    // @ts-ignore
    return this.observable._value;
  }

  private _navigate: Router['navigate'];

  constructor(
    _router: Router,
    _route: ActivatedRoute
  ) {
    this.observable = _route.fragment;
    this._navigate = _router.navigate.bind(_router);
  }

  add(name: string): void {
    this._navigate([], { fragment: name });
  }

  remove(): void {
    if (this.value) {
      this._history.back();
    }
  }

  toggle(name: string): void {
    if (this.value) {
      this._history.back();

    } else {
      this._navigate([], { fragment: name });
    }
  }

  observe(name: string, config: ObserveConfig = {}): Subscription {
    let isMatching: boolean;
    const pipeParams = config.pipeParams;
    const observable = pipeParams // @ts-ignore
      ? this.observable.pipe(...config.pipeParams)
      : this.observable;

    return observable.subscribe((newFragment) => {
      if (newFragment === name) {
        config.onMatch?.();
        isMatching = true;

      } else if (isMatching) {
        config.onEndMatching?.();
        isMatching = false;
      }
    });
  }
}
