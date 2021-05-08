import { DOCUMENT } from '@angular/common';
import { ElementRef, Inject, Injectable, NgZone } from '@angular/core';
import { noop, RunOutsideNgZone, RUN_OUTSIDE_NG_ZONE } from '@material-lite/angular-cdk/utils';
import { skip } from 'rxjs/operators';
import { rootChangeDetector } from './root-change-detector-ref';
import { Fragment } from './service/fragment';
import { DragDropEvent, DragDropListener } from './service/listener';

@Injectable({
  providedIn: 'root',
})
export class RootDrawer {
  readonly contentElementRef: ElementRef<HTMLElement>;

  isExisted: boolean;

  leaveTo: number;

  animationDuration: number = 320;

  private _rootChangeDetector = rootChangeDetector;

  private _removeDragDropListener: () => void = noop;

  constructor(
    private _ngZone: NgZone,
    private _fragment: Fragment,
    private _dragDropListener: DragDropListener,
    @Inject(DOCUMENT) _document: Document,
  ) {
    _fragment.observe('drawer', {
      onMatch: () => this.open(),
      onEndMatching: () => this.close(),
      pipeParams: [skip(1)]
    });
  }

  open(): void {
    this.isExisted = true;
    this._rootChangeDetector.ref.markForCheck();

    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => this.contentElementRef.nativeElement.style.transform = 'translateX(0%)', 16);
      setTimeout(() => {
      this._removeDragDropListener =
        this._dragDropListener.listen(window, this._onDragDrop.bind(this));
      }, this.animationDuration);
    });
  }

  close(): void {
    this._removeDragDropListener();
    this._removeDragDropListener = noop;

    this._ngZone.runOutsideAngular(() => setTimeout(() => this.contentElementRef.nativeElement.style.transform = 'translateX(-100%)', 16));

    const timeout = this.leaveTo;
    if (timeout) {
      clearTimeout(timeout);
    }

    this.leaveTo = setTimeout(() => {
      this.isExisted = false;
      this.leaveTo = 0;

      this._rootChangeDetector.ref.markForCheck();
    }, this.animationDuration) as any;

    this._rootChangeDetector.ref.markForCheck();
  }

  private _onDragDrop(type: 'down' | 'move' | 'up', onDownEvent: DragDropEvent, onMoveEvent: DragDropEvent): void {
    const elRef = this.contentElementRef;
    if (!elRef) { return; }

    const el = elRef.nativeElement;

    if (type === 'down') {
      el.style.transition = 'unset';

    } else {
      const xMovingDistance = Math.round((onMoveEvent.clientX - onDownEvent.clientX) / el.clientWidth * 1000) / 10;

      if (type === 'move') {
        if (-101 < xMovingDistance && xMovingDistance < 0) {
          el.style.transform = `translateX(${xMovingDistance}%)`;
        }

      } else { // type === 'up'
        el.style.removeProperty('transition');

        // 半分よりかくされていたら
        -50 > xMovingDistance
          ? this._fragment.remove()
          : el.style.transform = 'translateX(0%)';
      }
    }
  }
}
