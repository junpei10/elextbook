import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject,
  NgZone, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { noop } from '@material-lite/angular-cdk/utils';
import { unigramFactory } from 'src/app/common/ngram-factory';
import { RootHeader } from 'src/app/root-header.service';
import { Firestore, FIRESTORE } from 'src/app/service/firebase';
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
  @HostBinding('class.hidden') hasHidden: boolean = true;

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
    private _changeDetection: ChangeDetectorRef,
    ngZone: NgZone,
    @Inject(FIRESTORE) firestore: Firestore,
  ) {
    const session = this.listDataSession =
      new ListDataSession('workbook-data', firestore, ngZone, _changeDetection);

    session.getAllListData()
      .then(this.onGetListData.bind(this));

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

    this.hasHidden = true;

    const promise = words[0]
      ? this.listDataSession.getSearchedListData(words)
      : this.listDataSession.getAllListData();

    promise.then(this.onGetListData.bind(this));
  }

  onGetListData(): void {
    this.hasHidden = false;
    this._changeDetection.markForCheck();
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
