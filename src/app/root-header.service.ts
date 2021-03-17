import { DOCUMENT } from '@angular/common';
import { ApplicationInitStatus, Inject, Injectable, TemplateRef } from '@angular/core';
import { MlPortalAttachConfig } from '@material-lite/angular-cdk/portal';
import { noop, Subscription } from 'rxjs';
import { rootChangeDetector } from './root-change-detector-ref';
import { Fragment } from './service/fragment';
import { MediaQueryObserver } from './service/media-query';

type Mode = 'normal' | 'toolbar' | 'searching';
type CommonButtonType = 'drawer' | 'back';

@Injectable({
  providedIn: 'root',
})
export class RootHeaderStyling {
  paneClass: string;
  private _changeDetector = rootChangeDetector;

  private _mode: Mode = 'normal';
  get mode(): Mode {
    return this._mode;
  }

  private _commonButtonType: CommonButtonType = 'drawer';
  get commonButtonType(): CommonButtonType {
    return this._commonButtonType;
  }

  constructor(private _mediaQuery: MediaQueryObserver) {
    this._mediaQuery.store.changes.subscribe((state) => {
      this._updateStyle(state);
    });
  }

  private _updateStyle(mediaQueryState: 'mp' | 'pc'): void {
    this.paneClass = mediaQueryState === 'mp'
      ? 'root-header-' + this._mode + ' root-header' + this._commonButtonType + ' root-header-pane'
      : 'root-header-normal-pc' + ' root-header-' + this._commonButtonType + ' root-header-pane';
  }

  renderStyle(newStyle: { mode?: Mode; commonButton?: CommonButtonType }): void {
    const { mode, commonButton } = newStyle;

    if (mode) {
      this._mode = mode;
    }
    if (commonButton) {
      this._commonButtonType = commonButton;
    }

    const mqState = this._mediaQuery.store.getState();
    this._updateStyle(mqState);
    this._changeDetector.ref.markForCheck();
  }
}

@Injectable({
  providedIn: 'root'
})
export class RootHeaderEvents {
  commonButtonClickEvent: () => any;
  onMpWrapperClick?: () => any;

  onSwitchSearchingMode?: () => any;
  onSwitchNormalMode?: () => any;
  onSwitchToolbarMode?: () => any;

  private _searchingFragmentSubscription: Subscription;

  constructor(
    private _fragment: Fragment,
    private _rootHeaderStyling: RootHeaderStyling,
  ) {
    this.commonButtonClickEvent = () => _fragment.add('drawer');
  }

  mpWrapperClickEvent(): void {
    if (this._searchingFragmentSubscription) {
      this._fragment.add('searching');
    }

    this.onMpWrapperClick?.();
  }

  switchSearchingMode(): void {
    if (this._rootHeaderStyling.mode === 'searching') { return; }

    this._rootHeaderStyling.renderStyle({ mode: 'searching', commonButton: 'back' });
    this.onSwitchSearchingMode?.();

    this.commonButtonClickEvent = () => history.back();
  }

  switchNormalMode(): void {
    if (this._rootHeaderStyling.mode === 'normal') { return; }

    this._rootHeaderStyling.renderStyle({ mode: 'normal', commonButton: 'drawer' });
    this.onSwitchNormalMode?.();

    this.commonButtonClickEvent = () => {
      this._fragment.add('drawer');
    };
  }

  switchToolbarMode(): void {
    if (this._rootHeaderStyling.mode === 'toolbar') { return; }

    this._rootHeaderStyling.renderStyle({ mode: 'toolbar', commonButton: 'drawer' });
    this.onSwitchToolbarMode?.();
  }

  subscribeSearchingFragmentObserver(): void {
    if (this._searchingFragmentSubscription) { return; }

    this._searchingFragmentSubscription
      = this._fragment.observe('searching', {
        onMatch: () => this.switchSearchingMode(),
        onEndMatching: () => this.switchNormalMode()
      });
  }

  unsubscribeSearchingFragmentObserver(): void {
    const subscription = this._searchingFragmentSubscription;
    if (!subscription) { return; }

    subscription.unsubscribe();
    this._searchingFragmentSubscription = null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RootHeaderElement {
  content: TemplateRef<Element>;
  readonly contentPortalConfig: MlPortalAttachConfig = {
    animation: {
      enter: 280,
      leave: 280,
      className: 'root-header-content'
    }
  };

  predictiveCandidates: TemplateRef<Element>;
  readonly predictiveCandidatesPortalConfig: MlPortalAttachConfig = {
    animation: {
      enter: 280,
      leave: 280,
      className: 'root-header-predictive-candidates'
    }
  };
}
