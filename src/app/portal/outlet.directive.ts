import {
  Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,
  SimpleChange, SimpleChanges, ViewContainerRef
} from '@angular/core';
import { MlPortalAttachedRef } from './attached-ref';
import { MlPortalAttachConfig, MlPortalContent, MlPortalData, MlPortalOutlet } from './outlet.service';

interface Changes extends SimpleChanges {
  content: SimpleChange;
  key: SimpleChange;
}

@Directive({
  selector: '[mlPortalOutlet]',
  exportAs: 'mlPortalOutlet'
})
export class MlPortalOutletDirective implements OnChanges, OnDestroy {
  @Input('mlPortalOutlet') content: MlPortalContent | null | undefined;

  @Input('mlPortalOutletKey') key: string | null = null;
  get isPrivate(): boolean {
    return !this.key;
  }

  @Input('mlPortalOutletDestroyedDuration')
  set outletDestroyedDuration(duration: number) {
    this._portalData.outletDestroyedDuration = duration;
  }

  private _attachedEmitter: EventEmitter<MlPortalAttachedRef>;
  @Output('mlPortalAttached') get attachedEmitter(): EventEmitter<MlPortalAttachedRef> {
    return this._attachedEmitter || (this._attachedEmitter = new EventEmitter());
  }

  @Input('mlPortalAttachConfig') config: MlPortalAttachConfig;


  attachedRef: MlPortalAttachedRef | undefined;

  private _hasInitialized: boolean;

  private _portalData: MlPortalData;

  constructor(
    elementRef: ElementRef<HTMLElement>,
    viewContainerRef: ViewContainerRef,
    private _portalOutlet: MlPortalOutlet
  ) {
    this._portalData = {
      outletElement: elementRef.nativeElement,
      viewContainerRef,
      detachEvents: []
    };
  }

  ngOnChanges(changes: Changes): void {
    console.log(changes);
    let change: SimpleChange;

    /** @changes key */
    change = changes.key;
    if (change) {
      if (this._hasInitialized) {
        this.ngOnDestroy();
      }

      this._initialize();
    }

    /** @changes content */
    change = changes.content;
    if (change) {
      this.attachedRef?.detach();

      const content: MlPortalContent = change.currentValue;
      if (content) {
        if (!this._hasInitialized) {
          this._initialize();
        }

        const keyOrData = this.key || this._portalData;

        const attachedRef = this.attachedRef =
          this._portalOutlet.attach(content, keyOrData, this.config);

        if (this._attachedEmitter) {
          this._attachedEmitter.emit(attachedRef);
        }
      }
    }
  }

  ngOnDestroy(): void {
    const key = this.key;
    if (key) {
      // @ts-expect-error
      const storage = this._portalOutlet._portalDataStorage;
      const detachEvents = storage.get(key)!.detachEvents;

      const len = detachEvents.length;
      for (let i = 0; i < len; i++) {
        detachEvents[i](true);
      }

      storage.delete(key);

    } else {
      this._portalData.detachEvents[0]?.(true);
    }

    this._hasInitialized = false;
  }

  private _initialize(): void {
    const key = this.key;
    if (key) {
      if (this._portalOutlet.hasPortalData(key)) {
        // throw new Error('');
        // すでに作成されている趣旨のError
      } else {
        this._portalOutlet.setPortalData(key, this._portalData);
      }
    }

    this._hasInitialized = true;
  }
}
