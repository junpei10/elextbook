import { ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NoCompleteObservable, NoCompleteSubject, RunNgZone, RunOutsideNgZone, ClassAnimateType, ClassAnimation } from '../utils';
import { Subject } from 'rxjs';
import { MlPortalAttachConfig, MlPortalContentRef, MlPortalContentType, MlPortalData } from './outlet.service';

interface LifecycleHandler {
  subject?: NoCompleteSubject<void>;
  observable?: NoCompleteObservable<void>;
}

const callLifecycleSubjectNext = (subject: LifecycleHandler['subject']) => {
  subject!.next();
  // @ts-ignore
  subject!.observers = null;
  subject!.isStopped = true;
};

const getLifecycleObservable = (handler: LifecycleHandler): NoCompleteObservable<void> => {
  if (!handler.subject) {
    handler.subject = new Subject() as any;
    handler.observable = handler.subject!.asObservable();
  }

  return handler.observable!;
};

export class MlPortalAttachedRef {
  private _afterAttachedHandler?: LifecycleHandler;
  private _beforeDetachedHandler?: LifecycleHandler;
  private _afterDetachedHandler?: LifecycleHandler;

  private _animateRef: ClassAnimation['animate'];
  readonly animationConfig: NonNullable<MlPortalAttachConfig['animation']>;

  readonly data: Readonly<{
    outletKey: string | null;
    attachedOrder: number;
    outletElement: HTMLElement;
    contentType: MlPortalContentType;
    rootContentElement: HTMLElement;
  }>;

  constructor(
    contentType: MlPortalContentType,
    outletKey: string | null,
    attachedOrder: number,
    animationConfig: MlPortalAttachConfig['animation'],
    private _contentRef: MlPortalContentRef,
    private _portalData: MlPortalData,
    private _markForCheck: RunNgZone | ChangeDetectorRef['markForCheck'],
    private _runOutsideNgZone: RunOutsideNgZone,
  ) {
    this.data = {
      contentType,
      outletKey,
      attachedOrder,
      outletElement: _portalData.outletElement,
      get rootContentElement(): HTMLElement {
        return _contentRef.rootElement;
      }
    };

    this.animationConfig = animationConfig || {};
  }

  // componentを出力(attach)するとき、`rootContentElement`や`destroy`をすぐに代入することができない。そのため、発見できたタイミングでこの関数を呼び出す必要がある。
  // インスタンスから呼び出す必要があるため、`private`や`protected`にはできない
  initialize(): this {
    this._animateRef = new ClassAnimation(this._contentRef.rootElement.classList).animateRef;

    this.animationConfig.cancelOnAttach
      ? this._afterAttach()
      : this._animate('enter', () => this._afterAttach());

    this._portalData.detachEvents
      .push(this._detach.bind(this));

    return this;
  }

  private _afterAttach(): void {
    const handler = this._afterAttachedHandler;
    if (handler) {
      callLifecycleSubjectNext(handler.subject!);
    }
  }

  detach(): void {
    this._detach();
  }

  private _detach(outletDestroyed?: boolean): void {
    const beforeDetachedHandler = this._beforeDetachedHandler;
    if (beforeDetachedHandler) {
      callLifecycleSubjectNext(beforeDetachedHandler.subject!);
    }

    if (outletDestroyed) {
      // アニメーションなし ＆ 要素破壊なし
      const dur = this._portalData.outletDestroyedDuration;
      dur
        ? this._runOutsideNgZone(() => setTimeout(() => this._animate('leave', () => this._finalize()), dur))
        : this._finalize();

    } else {
      if (this.animationConfig.cancelOnDetach) {
        this._contentRef.destroy();
        this._finalize();
      } else {
        this._animate('leave', () => {
          this._contentRef.destroy();
          this._finalize();
        });
      }
    }

    this._portalData.detachEvents
      .splice(this.data.attachedOrder, 1);
  }

  private _finalize(): void {
    const afterDetachedHandler = this._afterDetachedHandler;
    if (afterDetachedHandler) {
      callLifecycleSubjectNext(afterDetachedHandler.subject!);
    }
  }

  private _animate(type: ClassAnimateType, onFinalize: () => void): void {
    const amtConf = this.animationConfig;
    const duration = amtConf[type];

    if (!duration) {
      onFinalize();
      return;
    }

    const className = amtConf.className;

    const _onFinalize = amtConf.checkChangesAfter
      ? () => this._markForCheck(() => onFinalize())
      : onFinalize;

    console.log(amtConf, amtConf.checkChangesAfter, _onFinalize);

    if (className) {
      this._runOutsideNgZone(() => {
        this._animateRef(type, className, duration)
          .then(() => _onFinalize());
      });

    } else {
      this._runOutsideNgZone(
        () => setTimeout(_onFinalize, duration)
      );
    }
  }

  afterAttached(): NoCompleteObservable<void> {
    let handler = this._afterAttachedHandler;
    if (!handler) { handler = this._afterAttachedHandler = {}; }

    return getLifecycleObservable(handler);
  }
  beforeDetached(): NoCompleteObservable<void> {
    let handler = this._beforeDetachedHandler;
    if (!handler) { handler = this._beforeDetachedHandler = {}; }

    return getLifecycleObservable(handler);
  }
  afterDetached(): NoCompleteObservable<void> {
    let handler = this._afterDetachedHandler;
    if (!handler) { handler = this._afterDetachedHandler = {}; }

    return getLifecycleObservable(handler);
  }
}
