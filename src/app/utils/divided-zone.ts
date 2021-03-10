import { inject, InjectionToken, NgZone } from '@angular/core';

export type RunNgZone = NgZone['run'];
export const RUN_NG_ZONE = new InjectionToken<RunNgZone>('`run` method only', {
  providedIn: 'root',
  factory: () => {
    // @ts-ignore
    const inner = inject(NgZone)._inner;
    return (fn, appLyThis, appLyArgs) => inner.run(fn, appLyThis, appLyArgs);
  }
});

export type RunOutsideNgZone = NgZone['runOutsideAngular'];
export const RUN_OUTSIDE_NG_ZONE = new InjectionToken<RunOutsideNgZone>('`runOutsideAngular` method only', {
  providedIn: 'root',
  factory: () => {
    // @ts-ignore
    const outer = inject(NgZone)._outer;
    return (fn) => outer.run(fn);
  }
});
