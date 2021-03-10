import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RootHeaderElement, RootHeaderEvents } from 'src/app/root-header.service';
import { Fragment } from 'src/app/service/fragment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  constructor(
    public fragment: Fragment,
    private rootHeaderElement: RootHeaderElement,
    private rootHeaderEvents: RootHeaderEvents
  ) {
    rootHeaderElement.content = null;
    this.rootHeaderEvents.switchNormalMode();
  }

  ngOnInit(): void {}

  historyBack(): void {
    history.back();
  }

}
