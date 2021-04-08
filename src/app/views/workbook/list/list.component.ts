import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject,
  NgZone, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { noop } from '@material-lite/angular-cdk/utils';
import { unigramFactory } from 'src/app/common/ngram-factory';
import { RootHeader } from 'src/app/root-header.service';
import { RootMain } from 'src/app/root-main.service';
import { Firestore, FIRESTORE } from 'src/app/service/firestore';
import { Fragment } from 'src/app/service/fragment';
import { ListDataSession } from 'src/app/service/list-data-session';
import { WorkbookData, WORKBOOK_CURRENT_DATA } from '../workbook';

@Component({
  selector: 'app-workbook-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class WorkbookListComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rootHeaderContent', { static: true })
  set setRootHeaderContent(templateRef: TemplateRef<any>) {
    this._rootHeader.content = templateRef;
  }

  @ViewChild('rootHeaderInput') set setRootHeaderInputRef(elementRef: ElementRef<HTMLInputElement>) {
    if (!elementRef) { return; }

    this._rootHeaderInputRef = elementRef;

    if (this._fragment.value === 'searching') {
      elementRef.nativeElement.focus();
      elementRef.nativeElement.tabIndex = 0;
    }
  }
  private _rootHeaderInputRef?: ElementRef<HTMLInputElement>;

  searchWords: string[];

  listDataSession: ListDataSession<WorkbookData>;

  constructor(
    public router: Router,
    private _rootHeader: RootHeader,
    private _fragment: Fragment,
    ngZone: NgZone,
    _changeDetection: ChangeDetectorRef,
    @Inject(FIRESTORE) _firestore: Firestore,
  ) {
    const session = this.listDataSession =
      new ListDataSession('workbook-data', _firestore, ngZone, _changeDetection);

    session.getAllListData();
      // .then(() => {
      //   rootChangeDetector.ref.markForCheck();
      // });

    _rootHeader.switchNormalMode();

    _rootHeader.onMpWrapperClick = noop;

    _rootHeader.subscribeSearchingFragmentObserver(
      this.focusInput.bind(this), this.distractInput.bind(this)
    );
  }

  ngAfterViewInit(): void {
    // this._rootHeaderElement.content = this._rootHeaderContent;
  }

  ngOnDestroy(): void {
    this._rootHeader.unsubscribeSearchingFragmentObserver();
  }

  gotoGame(event: PointerEvent, data: WorkbookData): void {
    if (data.disabled) { return; }

    const path = 'workbook-game/' + data.pathname;

    if (event.which === 2) {
      open('https://elextbook.web.app/' + path);
      return;
    }

    WORKBOOK_CURRENT_DATA.current = data;
    this.router.navigate([path]);
  }

  onEntrySearchBar(event: any): void {
    this._fragment.remove();

    const val = event.target.value as string;
    const words = this.searchWords = unigramFactory(val);

    words[0]
      ? this.listDataSession.getSearchedListData(words)
      : this.listDataSession.getAllListData();
  }

  focusInput(): void {
    const elRef = this._rootHeaderInputRef;
    if (!elRef) { return; }

    elRef.nativeElement.focus();
    elRef.nativeElement.tabIndex = 0;
  }

  distractInput(): void {
    const elRef = this._rootHeaderInputRef;
    if (!elRef) { return; }

    elRef.nativeElement.blur();
    elRef.nativeElement.tabIndex = -1;
  }
}
