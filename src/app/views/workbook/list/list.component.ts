import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject,
  NgZone,
  OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { unigramFactory } from 'src/app/common/ngram-factory';
import { RootHeaderElement, RootHeaderEvents } from 'src/app/root-header.service';
import { Firestore, FIRESTORE } from 'src/app/service/firestore';
import { ListDataSession } from 'src/app/service/list-data-session';
import { WorkbookData, WORKBOOK_CURRENT_DATA } from '../workbook';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class WorkbookListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('rootHeaderContent', { static: true }) private _rootHeaderContent: TemplateRef<any>;

  searchWords: string[];

  listDataSession: ListDataSession<WorkbookData>;

  constructor(
    public router: Router,
    private _rootHeaderEvents: RootHeaderEvents,
    private _rootHeaderElement: RootHeaderElement,
    _changeDetection: ChangeDetectorRef,
    ngZone: NgZone,
    @Inject(FIRESTORE) _firestore: Firestore,
  ) {
    const session = this.listDataSession =
      new ListDataSession('workbook-data', _firestore, ngZone, _changeDetection);

    session.getAllListData();

    _rootHeaderEvents.subscribeSearchingFragmentObserver();
  }

  ngOnInit(): void {
    this._rootHeaderElement.content = this._rootHeaderContent;
    // setTimeout(() => this._rootHeaderContent = this._rootHeaderContent);
    // rootChangeDetector.ref.markForCheck();
  }

  ngAfterViewInit(): void {
    // this._rootHeaderElement.content = this._rootHeaderContent;
  }

  ngOnDestroy(): void {
    this._rootHeaderEvents.unsubscribeSearchingFragmentObserver();
    this._rootHeaderContent = null;
  }

  gotoGame(event: PointerEvent, data: WorkbookData): void {
    const path = 'workbook-game/' + data.pathname;

    if (event.which === 2) {
      open('elextbook.web.app/' + path);
    }

    WORKBOOK_CURRENT_DATA.current = data;
    this.router.navigate([path]);
  }

  onEntrySearchBar(event): void {
    const val = event.target.value;
    const words = this.searchWords = unigramFactory(val);

    words[0]
      ? this.listDataSession.getSearchedListData(words)
      : this.listDataSession.getAllListData();
  }
}
