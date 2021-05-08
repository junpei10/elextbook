import { Inject, Injectable } from '@angular/core';
import { RunOutsideNgZone, RUN_OUTSIDE_NG_ZONE } from '@material-lite/angular-cdk/utils';

export type DragDropEvent = TouchEvent['touches'][number] | MouseEvent;
type Callback = (state: 'down' | 'up' | 'move', downEvent: DragDropEvent, movingEvent: DragDropEvent) => void;

interface State {
  callbacks: Callback[];
  removeListener: () => void;
  usedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DragDropListener {
  private _storage: WeakMap<EventTarget, State> = new (WeakMap || Map)();
  private _hasFiredTouchStart: boolean;

  constructor(
    @Inject(RUN_OUTSIDE_NG_ZONE) private _runOutsideNgZone: RunOutsideNgZone
  ) { }

  add(target: EventTarget, callback: Callback): void {
    const storage = this._storage;
    const state = storage.get(target);

    if (state) {
      state.callbacks.push(callback);
      state.usedCount++;

    } else {
      const callbacks = [callback];

      const listen = this._listenPointerEvent;

      this._runOutsideNgZone(() => {
        const _removeTouchstartListener =
          listen(target, 'touchstart', (event) => this._onTouchstart(target, callbacks, event));

        const _removeMousedownListener =
          listen(target, 'mousedown', (event) => this._onMousedown(target, callbacks, event));

        const removeListener = () => {
          _removeTouchstartListener();
          _removeMousedownListener();
        };

        storage.set(target, { callbacks, removeListener, usedCount: 1 });
      });
    }
  }

  remove(target: EventTarget, callback: Callback): void {
    const storage = this._storage;
    const state = storage.get(target);

    if (state) {
      const callbacks = state.callbacks;
      const callbackLength = callbacks.length;
      for (let i = 0; i < callbackLength; i++) {
        if (callbacks[i] === callback) {

          const usedCount = (state.usedCount -= 1);
          if (usedCount < 1) {
            state.removeListener();
            storage.delete(target);

          } else {
            callbacks.splice(i, 1);
          }

          return;
        }
      }
    }
  }

  listen(target: EventTarget, callback: Callback): () => void {
    this.add(target, callback);
    return () => this.remove(target, callback);
  }

  private _onTouchstart(target: EventTarget, callbacks: Callback[], onDownEvent: TouchEvent): void {
    this._hasFiredTouchStart = true;

    const onDownSingleOnEvent = onDownEvent.touches[0];

    // 変数のスコープを増やさないために、forEach関数を用いる
    callbacks.forEach(v => v('down', onDownSingleOnEvent, onDownSingleOnEvent));

    const listen = this._listenPointerEvent;

    const removeTouchmoveListener =
      listen(
        target, 'touchmove',
        (event: TouchEvent) => {
          event.preventDefault();
          callbacks.forEach(v => v('move', onDownSingleOnEvent, event.touches[0]));
        }
      );

    const removeTouchendListener =
      listen(target, 'touchend',
        (event: TouchEvent) => {
          callbacks.forEach(v => v('up', onDownSingleOnEvent, event.changedTouches[0] || {}));
          removeTouchmoveListener();
          removeTouchendListener();

          setTimeout(() => this._hasFiredTouchStart = false, 160);
        }
      );
  }

  private _onMousedown(target: EventTarget, callbacks: Callback[], onDownEvent: MouseEvent): void {
    if (this._hasFiredTouchStart) { return; }

    callbacks.forEach(v => v('down', onDownEvent, onDownEvent));

    const listen = this._listenPointerEvent;

    const removeTouchmoveListener =
      listen(target, 'mousemove',
        (event: MouseEvent) => {
          event.preventDefault();
          callbacks.forEach(v => v('move', onDownEvent, event));
        }
      );

    const removeTouchendListener =
      listen(target, 'mouseup',
        (event) => {
          callbacks.forEach(v => v('up', onDownEvent, event));
          removeTouchmoveListener();
          removeTouchendListener();
        }
      );
  }

  private _listenPointerEvent(target: EventTarget, eventName: string, callback: (event: any) => any): () => void {
    target.addEventListener(eventName, callback, { passive: false });
    return () => target.removeEventListener(eventName, callback);
  }
}
