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

  private _value: string | null;
  get value(): string | null {
    return this._value;
  }

  private _navigate: Router['navigate'];

  constructor(
    _router: Router,
    _route: ActivatedRoute
  ) {
    this._navigate = _router.navigate.bind(_router);

    const obs = this.observable = _route.fragment;
    obs.subscribe((fragment) => this._value = fragment);
  }

  add(name: string): void {
    this._navigate([], { fragment: name });
  }

  remove(): void {
    if (this.value) {
      this._history.back();
      this._value = null;
    }
  }

  toggle(name: string): void {
    if (this.value) {
      this._history.back();
      this._value = null;

    } else {
      this._navigate([], { fragment: name });
    }
  }

  observe(name: string, config: ObserveConfig = {}): Subscription {
    let isMatching: boolean = false;

    const pipeParams = config.pipeParams;
    const observable = pipeParams // @ts-ignore
      ? this.observable.pipe(...config.pipeParams)
      : this.observable;

    return observable.subscribe((newFragment) => {
      if (newFragment === name) {
        const onMatch = config.onMatch;
        if (onMatch) { onMatch(); }
        isMatching = true;

      } else if (isMatching) {
        const onEndMatching = config.onEndMatching;
        if (onEndMatching) { onEndMatching(); }
        isMatching = false;
      }
    });
  }
}
