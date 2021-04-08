import { Component } from '@angular/core';
import { noop } from 'rxjs';
import { RootHeader } from 'src/app/root-header.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {

  constructor(
    rootHeader: RootHeader
  ) {
    rootHeader.switchNormalMode();
    rootHeader.onMpWrapperClick = noop;
    rootHeader.setDefaultContent();
  }

}
