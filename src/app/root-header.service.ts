import { ChangeDetectionStrategy, Component, ElementRef, Injectable, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Class, noop } from '@material-lite/angular-cdk/utils';
import { Subscription } from 'rxjs';
import { Fragment } from './service/fragment';

type Mode = 'normal' | 'toolbar' | 'searching';
type MainActionType = 'drawer' | 'backing';

class RootHeaderStyling {
  readonly headerClassList: DOMTokenList;

  readonly mode: Mode;
  readonly mainActionType: MainActionType;
  readonly theme: string;

  setHeaderElement(elementRef: ElementRef<HTMLElement>): void {
    // @ts-ignore: assign the readonly variable
    this.headerClassList = elementRef.nativeElement.classList;
  }

  setTheme(theme: string | null): void {
    const prevTheme = this.theme;
    if (theme === prevTheme) { return; }

    const classList = this.headerClassList;

    if (prevTheme) {
      classList.remove('ml-' + prevTheme);
    }

    if (theme) {
      classList.add('ml-' + theme);
    }

    // @ts-ignore
    this.theme = theme;
  }

  setMode(mode: Mode): void {
    const prevMode = this.mode;
    if (mode === prevMode) { return; }

    const classList = this.headerClassList;

    classList.remove('root-header-' + prevMode);
    classList.add('root-header-' + mode);

    // @ts-ignore: assign the readonly variable
    this.mode = mode;
  }

  setMainAction(type: MainActionType): void {
    const prevType = this.mainActionType;
    if (prevType === type) { return; }

    const classList = this.headerClassList;

    classList.remove('root-header-' + prevType + '-type');
    classList.add('root-header-' + type + '-type');

    // @ts-ignore: assign the readonly variable
    this.mainActionType = type;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RootHeader {
  private _history = history;

  content: TemplateRef<Element> | Class<any>;
  suggest: TemplateRef<Element>;

  onMpWrapperClick?: () => any;

  styling: RootHeaderStyling;

  private _searchingFragmentSubscription: Subscription | null;

  mainAction: () => any;

  constructor(private _fragment: Fragment) {
    this.styling = new RootHeaderStyling();
  }

  setDefaultContent(): void {
    this.content = DefaultHeaderContentComponent;
  }

  mpWrapperClickEvent(): void {
    // 'searching'フラグメントが監視されている場合、フラグメントを追加する
    if (this._searchingFragmentSubscription) {
      this._fragment.add('searching');
    }

    this.onMpWrapperClick?.();
  }

  switchNormalMode(): void {
    const styling = this.styling;

    if (styling.mode === 'normal') { return; }

    styling.setMode('normal');
    styling.setMainAction('drawer');
    // this.onSwitchNormalMode?.();

    this.mainAction = () => this._fragment.toggle('drawer');
  }

  switchSearchingMode(): void {
    const styling = this.styling;

    if (styling.mode === 'searching') { return; }

    styling.setMode('searching');
    styling.setMainAction('backing');

    this.mainAction = () => this._history.back();
  }

  switchToolbarMode(): void {
    const styling = this.styling;

    if (styling.mode === 'toolbar') { return; }

    styling.setMode('toolbar');
    styling.setMainAction('backing');

    this.mainAction = () => this._history.back();
  }

  subscribeSearchingFragmentObserver(onMatch: () => void = noop, onEndMatching: () => void = noop): void {
    if (this._searchingFragmentSubscription) { return; }

    this._searchingFragmentSubscription
      = this._fragment.observe('searching', {
        onMatch: () => {
          this.switchSearchingMode();
          onMatch();
        },
        onEndMatching: () => {
          this.switchNormalMode();
          onEndMatching();
        }
      });
  }

  unsubscribeSearchingFragmentObserver(): void {
    const subscription = this._searchingFragmentSubscription;
    if (!subscription) { return; }

    subscription.unsubscribe();
    this._searchingFragmentSubscription = null;
  }
}

@Component({
  selector: 'app-default-header-content',
  host: {
    class: 'root-header-content',
    routerLink: '/home'
  },
  styles: [`
  app-default-header-content {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .root-header-default-heading {
    margin: 0 4px 0 0;
    font-size: 19px;
    letter-spacing: -1px;
  }
`],
  template: `
    <h1 class="root-header-default-heading">Elextbook</h1>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 453.54 570.65" height="20px" width="20px" xmlns:v="https://vecta.io/nano">
      <path
        d="M28.41 570.65C12.723 570.633.011 557.917 0 542.23V63.93C.039 28.638 28.638.039 63.93 0H441.7c6.537.006 11.834 5.303 11.84 11.84v499.61c-.006 6.537-5.303 11.834-11.84 11.84h-12.42c-6.537-.006-11.834-5.303-11.84-11.84V39.18a7.1 7.1 0 0 0-7.11-7.11H64.83c-11.167.142-20.142 9.242-20.13 20.41.011 11.113 9.017 20.119 20.13 20.13h315.65a11.78 11.78 0 0 1 10.71 11.72v474.48c-.011 6.534-5.306 11.829-11.84 11.84z"
        fill="#9c27b0"
      />
      <path d="M226.29 151.56L94.75 367.09h98.36l-16.46 142.83 131.54-215.54h-98.33l16.43-142.82z" fill="#ffeb3b" fill-rule="evenodd" />
    </svg>
`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultHeaderContentComponent {}
