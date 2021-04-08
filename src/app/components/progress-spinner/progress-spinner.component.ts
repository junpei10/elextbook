import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';

@Component({
  selector: '[appProgressSpinner]',
  template: `
    <div class="app-progress-spinner" *ngIf="hasShown" [@fadeInOut]="hasShown">
      <div class="app-progress-spinner-body"></div>
    </div>

    <ng-content></ng-content>
  `,
  styleUrls: ['./progress-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeInOut', [
      state(':enter', style({ opacity: 0 })),
      transition(':enter', [
        animate('200ms', style({ opacity: 1 }))
      ]),

      state(':leave', style({ opacity: 1 })),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ])
  ],
  host: {
    '[class.spinner-brothers-animation-noopable]': 'outing'
  }
})
export class ProgressSpinnerComponent implements OnChanges {
  @Input('progressSpinnerShown')
  hasShown: boolean;

  outing: boolean;

  constructor(
    private _changeDetector: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes.hasShown;

    if (change.isFirstChange()) { return; }

    if (!change.currentValue) {
      this.outing = true;

      setTimeout(() => {
        this.outing = false;
        this._changeDetector.markForCheck();
      }, 200);
    }
  }
}
