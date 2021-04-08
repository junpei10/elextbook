import { animate, query, sequence, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, Inject,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { RouteConfigLoadStart, Router } from '@angular/router';
import { RunOutsideNgZone, RUN_OUTSIDE_NG_ZONE } from '@material-lite/angular-cdk/utils';
import { MlTheming, ML_DARK_THEME, ML_DEEPPURPLE_AMBER_PALETTE, ML_LIGHT_THEME } from '@material-lite/angular/core';
import { AppMeta } from './app-meta.service';
import { AppRouteData } from './app-routing.module';
import { rootChangeDetector } from './root-change-detector-ref';
import { RootDrawer } from './root-drawer.service';
import { RootHeader } from './root-header.service';
import { RootMain } from './root-main.service';
import { Fragment } from './service/fragment';
import { MediaQueryObserver } from './service/media-query';
import { RouteChanges, ROUTE_CHANGES } from './service/route-observer';
import { YoungestRoute } from './service/youngest-route';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('routeAnimation', [
      transition('home => *, workbook-list => *, workbook-game => *',
        sequence([
          query(':enter', style({ position: 'absolute', pointerEvents: 'none', width: '100%', opacity: 0, top: 0, left: 0 })),

          query(':leave', [
            style({  opacity: 1, width: '100%', top: 0, left: 0 }),
            animate('160ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 0 })),
          ], { optional: true }),

          query(':leave',
            animate('8ms', style({ position: 'absolute', pointerEvents: 'none' })),
            { optional: true }
          ),

          query(':enter', [
            style({ position: 'relative', pointerEvents: 'auto' }),
            animate('160ms 8ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1 }))
          ], { optional: true })
        ])
      )
    ])
  ]
})
export class AppComponent implements DoCheck {
  @ViewChild('rootHeaderRef') set setRootHeader(elementRef: ElementRef<HTMLElement>) {
    this.rootHeader.styling.setHeaderElement(elementRef);
  }

  title = 'elextbook';
  doCheckCount: number = 0;

  readonly history = history;

  routeNavSelectedIndex: number = 0;
  readonly routeNavSelectedRoute: { [key: string]: 'primary' | false } = {
    home: false,
    textbook: false,
    workbook: false,
    library: false,
    settings: false,
    notFound: false
  };
  private _routeNavSelectedKey: string = 'home';

  mediaQueryStatus: {
    isMp: boolean;
    mainActionButtonVariant: 'icon' | 'basic';
    navTrackerPosition: 'after' | 'before';
    navTrackerOrientation: 'vertical' | 'horizontal';
  } = {} as any;

  readonly headerContentPortalConfig = {
    animation: {
      enter: 280,
      leave: 280,
      className: 'root-header-center-content'
    }
  };

  readonly headerSuggestPortalConfig = {
    animation: {
      enter: 280,
      leave: 280,
      className: 'root-header-center-suggest'
    }
  };

  routeKey: string;

  lazyLoading: boolean;

  isDarkTheme: boolean;

  constructor(
    public fragment: Fragment,
    public rootHeader: RootHeader,
    public rootDrawer: RootDrawer,
    public rootMain: RootMain,
    private _router: Router,
    @Inject(RUN_OUTSIDE_NG_ZONE) runOutsideNgZone: RunOutsideNgZone,
    @Inject(DOCUMENT) private _document: Document,
    mlTheming: MlTheming,
    changeDetector: ChangeDetectorRef,
    appMeta: AppMeta,
    youngestRoute: YoungestRoute<AppRouteData>,
    mediaQuery: MediaQueryObserver,
    @Inject(ROUTE_CHANGES) routeChanges: RouteChanges,
  ) {
    appMeta.commonTitle = 'Elextbook';
    appMeta.titleDivider = ' | ';

    rootChangeDetector.ref = changeDetector;

    mlTheming.initialize([
      { theme: ML_LIGHT_THEME, palette: {
        ...ML_DEEPPURPLE_AMBER_PALETTE,
        accent: {
          color: '#009688',
          contrast: '#fff'
        }
      }},
      { theme: ML_DARK_THEME, palette: ML_DEEPPURPLE_AMBER_PALETTE, wrapperClass: 'dark-theme' }
    ]);

    mediaQuery.observe('(min-width: 1025px)');
    mediaQuery.store.changes.subscribe((value) => {
      if (value === 'mp') {
        this.mediaQueryStatus = {
          isMp: true,
          mainActionButtonVariant: 'icon',
          navTrackerPosition: 'before',
          navTrackerOrientation: 'horizontal'
        };
      } else {

        this.mediaQueryStatus = {
          isMp: false,
          mainActionButtonVariant: 'basic',
          navTrackerPosition: 'after',
          navTrackerOrientation: 'vertical'
        };
      }

      changeDetector.markForCheck();
    });

    _router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.lazyLoading = true;
      }
    });

    routeChanges.subscribe(() => {
      runOutsideNgZone(() => setTimeout(() => scrollTo({ top: 0 }), 160));
      this.lazyLoading = false;

      const data = youngestRoute.state.data;

      appMeta.updateMeta(data);
      const routeKey = this.routeKey = data.parentKeys[0] || data.key;

      const route = this.routeNavSelectedRoute;
      route[this._routeNavSelectedKey] = false;

      switch (routeKey) {
        case 'home':
          this.routeNavSelectedIndex = 0;
          this._routeNavSelectedKey = routeKey;
          route.home = 'primary';
          break;

        case 'textbook-game':
        case 'textbook-list':
          this.routeNavSelectedIndex = 1;
          this._routeNavSelectedKey = 'textbook';
          route.textbook = 'primary';
          break;

        case 'workbook-game':
        case 'workbook-list':
          this.routeNavSelectedIndex = 2;
          this._routeNavSelectedKey = 'workbook';
          route.workbook = 'primary';
          break;

        case 'library':
          this.routeNavSelectedIndex = 3;
          this._routeNavSelectedKey = routeKey;
          route.library = 'primary';
          break;

        case 'settings':
          this.routeNavSelectedIndex = 4;
          this._routeNavSelectedKey = routeKey;
          route.settings = 'primary';
          break;

        default:
          this.routeNavSelectedIndex = null!;
          this._routeNavSelectedKey = 'notFound';
      }
    });
  }

  ngDoCheck(): void {
    // console.log(this.doCheckCount++);
  }

  toggleDarkTheme(): void {
    if (this.isDarkTheme) {
      this._document.body.classList.remove('dark-theme');
      this.isDarkTheme = false;

    } else {
      this._document.body.classList.add('dark-theme');
      this.isDarkTheme = true;
    }
  }
}
