import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { noop } from '@material-lite/angular-cdk/utils';
import { RootHeader } from 'src/app/root-header.service';
import { Fragment } from 'src/app/service/fragment';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<any>;
}

const _isPwa =
  matchMedia('(display-mode: standalone)').matches // @ts-ignore
  || navigator.standalone as boolean;

const _beforeInstallPromptSupported: boolean = (() => {
  const _navigator = navigator;
  const userAgent = _navigator.userAgent;

  return _navigator.serviceWorker && // @ts-ignore
        (userAgent.includes('CriOS') || !!window.chrome && !window.opr && _navigator.vendor === 'Google Inc.' || userAgent.includes('SamsungBrowser'));
})();

let _beforeInstallPromptEvent: BeforeInstallPromptEvent | null = null;
let _onFireBeforeInstallPrompt: (() => void) | null = null;
if (_beforeInstallPromptSupported) { // @ts-ignore
  addEventListener('beforeinstallprompt', (event: BeforeInstallPromptEvent) => {
    _beforeInstallPromptEvent = event;

    const onFire = _onFireBeforeInstallPrompt;

    if (onFire !== null) { onFire(); }
  });
}

let _hasLoadedComponent: boolean = false;
let _hasLoadedFirstViewImage: boolean = false;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host: { '[class.first-load]': 'isFirstLoad' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly isPwa = _isPwa;
  readonly beforeInstallPromptSupported;

  readonly isFirstLoad: boolean;
  hasLoadedFirstViewImage: boolean = _hasLoadedFirstViewImage;

  installButtonIsDisabled: boolean;

  constructor(
    rootHeader: RootHeader,
    public fragment: Fragment,
    private _changeDetector: ChangeDetectorRef
  ) {
    rootHeader.setDefaultContent();
    rootHeader.switchNormalMode();
    rootHeader.onMpWrapperClick = noop;

    this.isFirstLoad = !_hasLoadedComponent;
    _hasLoadedComponent = true;

    if (_beforeInstallPromptSupported) {
      this.beforeInstallPromptSupported = true;

      if (!_beforeInstallPromptEvent) {
        this.installButtonIsDisabled = true;

        _onFireBeforeInstallPrompt = () => {
          this.installButtonIsDisabled = false;
          this._changeDetector.detectChanges();

          _onFireBeforeInstallPrompt = null;
        };
      }

    } else {
      this.beforeInstallPromptSupported = false;
    }
  }

  ngOnDestroy(): void {
    _onFireBeforeInstallPrompt = null;
  }

  ngAfterViewInit(): void {
    if (!this.hasLoadedFirstViewImage) {
      const img = new Image();

      img.onload = () => setTimeout(() => {
        this.hasLoadedFirstViewImage = _hasLoadedFirstViewImage = true;
        this._changeDetector.markForCheck();
      }, 320);

      img.src = 'https://storage.googleapis.com/elextbook.appspot.com/home-first-view.png';
    }
  }

  installPwa(): void {
    const event = _beforeInstallPromptEvent;

    if (event !== null) {
      event.prompt();
    }
  }

  openGuidDialog(): void {

  }
}
