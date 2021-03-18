import { animate, query, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AppMeta } from './app-meta.service';
import { rootChangeDetector } from './root-change-detector-ref';
import { RootDrawer } from './root-drawer.service';
import { RootHeaderElement, RootHeaderEvents, RootHeaderStyling } from './root-header.service';
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
    trigger('rootDrawerAnimation', [
      transition('true <=> false', [
        query(':enter', [
          state('*', style({ transform: 'translateX(-100%)' })),
          animate('280ms cubic-bezier(0.25, 0.8, 0.25, 1)',
            style({
              pointerEvents: 'none',
              background: 'pink',
              transform: 'translateX(0%)'
            })
          )
        ]),
        query(':leave', [
          state('*', style({ transform: 'translateX(0%)' })),
          animate('280ms cubic-bezier(0.25, 0.8, 0.25, 1)',
            style({
              pointerEvents: 'none',
              background: 'pink',
              transform: 'translateX(-100%)'
            })
          )
        ]
        )
      ])
    ])
  ]
})
export class AppComponent implements OnInit, DoCheck {
  title = 'elextbook';
  doCheckCount: number = 0;

  footerTabSelectedIndex: number = 0;

  constructor(
    public mediaQuery: MediaQueryObserver,
    public rootHeaderStyling: RootHeaderStyling,
    public rootHeaderEvents: RootHeaderEvents,
    public rootHeaderElement: RootHeaderElement,
    public rootDrawer: RootDrawer,
    _changeDetector: ChangeDetectorRef,
    appMeta: AppMeta,
    youngestRoute: YoungestRoute,
    @Inject(ROUTE_CHANGES) routeChanges: RouteChanges
  ) {
    mediaQuery.observe('(min-width: 1024px)');
    mediaQuery.store.changes.subscribe(() => _changeDetector.markForCheck());

    appMeta.commonTitle = 'Elextbook';
    appMeta.titleDivider = ' | ';

    routeChanges.subscribe(() => {
      appMeta.updateMeta(youngestRoute.state.data);
      // rootDrawer.close();
    });

    rootChangeDetector.ref = _changeDetector;
  }

  ngOnInit(): void {
    // setTimeout(() => { this.router.navigate([], 'fragment'); });
  }

  ngDoCheck(): void {
    console.log(this.doCheckCount++);
  }

}
