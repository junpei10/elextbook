import { animate, query, sequence, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, Inject, OnInit,
  ViewEncapsulation
} from '@angular/core';
import { AppMeta } from './app-meta.service';
import { AppRouteData } from './app-routing.module';
import { rootChangeDetector } from './root-change-detector-ref';
import { RootDrawer } from './root-drawer.service';
import { RootHeaderElement, RootHeaderEvents, RootHeaderStyling } from './root-header.service';
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
          query(':enter', style({ position: 'absolute', pointerEvents: 'none', opacity: 0 })),

          query(':leave', [
            style({  opacity: 1 }),
            animate('200ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 0 })),
          ], { optional: true }),

          query(':leave',
            animate('0.0001ms', style({ position: 'absolute', pointerEvents: 'none' })),
            { optional: true }
          ),

          query(':enter', [
            style({ position: 'inherit', pointerEvents: 'auto' }),
            animate('200ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1 }))
          ], { optional: true })
        ])
      )
    ])
  ]
})
export class AppComponent implements OnInit, DoCheck {
  title = 'elextbook';
  doCheckCount: number = 0;

  footerTabSelectedIndex: number = 0;

  history = history;

  mediaQueryStatus: {
    isMp: boolean;
    headerCommonButtonVariant: 'icon' | 'basic';
    mainNavTrackerPosition: 'after' | 'before';
    mainNavTrackerOrientation: 'vertical' | 'horizontal';
  } = {} as any;

  routeKey: string;

  constructor(
    public fragment: Fragment,
    public rootHeaderStyling: RootHeaderStyling,
    public rootHeaderEvents: RootHeaderEvents,
    public rootHeaderElement: RootHeaderElement,
    public rootDrawer: RootDrawer,
    changeDetector: ChangeDetectorRef,
    appMeta: AppMeta,
    youngestRoute: YoungestRoute<AppRouteData>,
    mediaQuery: MediaQueryObserver,
    @Inject(ROUTE_CHANGES) routeChanges: RouteChanges
  ) {
    appMeta.commonTitle = 'Elextbook';
    appMeta.titleDivider = ' | ';

    mediaQuery.observe('(min-width: 1024px)');
    mediaQuery.store.changes.subscribe((value) => {
      if (value === 'mp') {
        this.mediaQueryStatus = {
          isMp: true,
          headerCommonButtonVariant: 'icon',
          mainNavTrackerPosition: 'before',
          mainNavTrackerOrientation: 'horizontal'
        };
      } else {

        this.mediaQueryStatus = {
          isMp: false,
          headerCommonButtonVariant: 'basic',
          mainNavTrackerPosition: 'after',
          mainNavTrackerOrientation: 'vertical'
        };
      }

      changeDetector.markForCheck();
    });

    routeChanges.subscribe(() => {
      const data = youngestRoute.state.data;

      appMeta.updateMeta(data);
      const routeKey = this.routeKey =
        data.parentKeys[0] || data.key;

      this.footerTabSelectedIndex = routeKey === 'home'
        ? 0
        : routeKey === 'workbook-list' || routeKey === 'workbook-game'
          ? 1
          : 0;

      console.log(routeKey);
    });

    rootChangeDetector.ref = changeDetector;
  }

  ngOnInit(): void {
    // setTimeout(() => { this.router.navigate([], 'fragment'); });
  }

  ngDoCheck(): void {
    console.log(this.doCheckCount++);
  }
}
