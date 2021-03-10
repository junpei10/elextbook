import { ChangeDetectorRef, NgZone } from '@angular/core';
import { Firestore } from '../firestore';

export interface ListData {
  index: number;
  category: string;
  searchToken: {
    [token: string]: true;
  };
}

export class ListDataSession<D extends ListData> {
  value: {
    [category: string]: D[]
  };
  categories: string[];

  waitingResponse: boolean;
  notMatched: boolean;

  set sortDirection(direction: 'desc' | 'asc') {
    this._sort = direction === 'desc'
      ? descIndexSort
      : ascIndexSort;
  }

  private _sort: (array: { index: number }[]) => void = descIndexSort;

  constructor(
    private _collectionPath: string,
    private _firestore: Firestore,
    private _ngZone: NgZone,
    private _changeDetector: ChangeDetectorRef
  ) {}

  private _initialize(): void {
    this.waitingResponse = true;
    this.notMatched = false;
    this.value = {};
    this.categories = [];
  }

  private _finalize(): void {
    this._ngZone.run(() => {
      this.waitingResponse = false;
      this._changeDetector.markForCheck();
    });
  }

  getAllListData(): void {
    this._initialize();

    this._ngZone.runOutsideAngular(() => {
      this._firestore.collection(this._collectionPath)
        .orderBy('index', this.sortDirection).get()
        .then((result) => {
          if (result.empty) {
            this.notMatched = true;
          } else {
            result.forEach((value) => {
              this.distributeData(value.data() as any);
            });
          }
        })
        .then(() => this._finalize());
    });
  }

  getSearchedListData(searchWords: string[]): void {
    this._initialize();

    this._ngZone.runOutsideAngular(() => {
      let query = this._firestore.collection(this._collectionPath) as any;

      searchWords.forEach((word) => {
        query = query.where(`searchToken.${word}`, '==', true);
      });

      query.get()
        .then((result) => {
          if (result.empty) {
            this.notMatched = true;
          } else {
            result.forEach((res) => {
              this.distributeData(res.data());
            });

            const { _sort, value, categories } = this;
            const len = categories.length;
            for (let i = 0; i < len; i++) {
              _sort(value[categories[i]]);
            }
          }
        })
        .then(() => this._finalize());
    });
  }

  distributeData(data: D): void {
    const category = data.category;

    let ref = this.value[category];

    if (!ref) {
      ref = this.value[data.category] = [];
      this.categories.push(category);
    }

    ref.push(data);
  }
}

const ascIndexSort = (array: { index: number }[]) => {
  array.sort((x, y) => x.index > y.index ? 1 : -1);
};

const descIndexSort = (array: { index: number }[]) => {
  array.sort((x, y) => x.index > y.index ? -1 : 1);
};

