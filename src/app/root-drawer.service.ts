import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { skip } from 'rxjs/operators';
import { rootChangeDetector } from './root-change-detector-ref';
import { RootHeaderEvents } from './root-header.service';
import { Fragment } from './service/fragment';

@Injectable({
  providedIn: 'root',
})
export class RootDrawer {
  paneClass: string = 'root-drawer-pane';

  isExisted: boolean;

  private _rootChangeDetector = rootChangeDetector;

  constructor(
    @Inject(DOCUMENT) _document: Document,
    _fragment: Fragment,
    _rootHeaderEvents: RootHeaderEvents
  ) {
    _fragment.observe('drawer', {
      onMatch: () => this.open(),
      onEndMatching: () => this.close(),
      observable: _fragment.fragmentObservable.pipe(skip(1))
    });
  }

  open(): void {
    this.isExisted = true;
    // this.paneClass = 'root-header-drawer-pane';
    // this._rootChangeDetector.ref.markForCheck();
  }

  close(): void {
    this.isExisted = false;
  }
}
