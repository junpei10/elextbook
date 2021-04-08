import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '../../store';

type MediaQueryState = 'pc' | 'mp';
type MediaQueryAction = 'PC' | 'MP';

export type MediaQueryStore = Store<MediaQueryState, MediaQueryAction>;

@Injectable({
  providedIn: 'root'
})
export class MediaQueryObserver {

  store: MediaQueryStore = new Store({
    state: 'mp',
    reducer: (_, action) => {
      switch (action.type) {
        case 'MP':
          return 'mp';
        case 'PC':
          return 'pc';
      }
    }
  }, {
    subject: new BehaviorSubject('mp')
  });

  mediaQueryList: MediaQueryList | null;

  observe(breakpoint: string): void {
    const mql = this.mediaQueryList = matchMedia(breakpoint);

    mql.addEventListener
      ? mql.addEventListener('change', this._onChange.bind(this))
      : mql.addListener(this._onChange.bind(this));

    this._onChange(mql);
  }

  private _onChange(event: MediaQueryListEvent | MediaQueryList): void {
    event.matches
      ? this.store.dispatch({ type: 'PC' })
      : this.store.dispatch({ type: 'MP' });
  }

  unobserve(): void {
    if (!this.mediaQueryList) { return; }

    this.mediaQueryList.removeEventListener('change', this._onChange.bind({ store: this.store }));
    this.mediaQueryList = null;
  }
}
