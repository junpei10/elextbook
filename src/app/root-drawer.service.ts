import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { skip } from 'rxjs/operators';
import { rootChangeDetector } from './root-change-detector-ref';
import { Fragment } from './service/fragment';

@Injectable({
  providedIn: 'root',
})
export class RootDrawer {
  isExisted: boolean;

  leaveTo: number;

  leaveAnimationDuration: number = 320;

  private _rootChangeDetector = rootChangeDetector;

  constructor(
    @Inject(DOCUMENT) _document: Document,
    _fragment: Fragment,
  ) {
    _fragment.observe('drawer', {
      onMatch: () => this.open(),
      onEndMatching: () => this.close(),
      pipeParams: [skip(1)]
    });
  }

  open(): void {
    this.isExisted = true;
    // this.paneClass = 'root-header-drawer-pane';

    this._rootChangeDetector.ref.markForCheck();
  }

  close(): void {
    const timeout = this.leaveTo;
    if (timeout) {
      clearTimeout(timeout);
    }

    this.leaveTo = setTimeout(() => {
      this.isExisted = false;
      this.leaveTo = 0;

      this._rootChangeDetector.ref.markForCheck();
    }, this.leaveAnimationDuration) as any;

    this._rootChangeDetector.ref.markForCheck();
  }
}
