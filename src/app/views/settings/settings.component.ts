import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { noop } from '@material-lite/angular-cdk/utils';
import { RootHeader } from 'src/app/root-header.service';
import { USER } from 'src/app/user';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  user: USER;

  constructor(
    rootHeader: RootHeader
  ) {
    rootHeader.setDefaultContent();
    rootHeader.switchNormalMode();
    rootHeader.onMpWrapperClick = noop;
  }

  ngOnInit(): void {
  }

  onChangeConfig(key: string): void {
  }

}
