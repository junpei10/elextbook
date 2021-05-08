import { ChangeDetectorRef, NgZone } from '@angular/core';
import { Firestore } from '../firebase';

export interface ListData {
  index: number;
  category: string;
  searchToken: {
    [token: string]: true;
  };
}

type Query = firebase.default.firestore.Query<firebase.default.firestore.DocumentData>;

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
  ) {
  }

  private _initialize(): void {
    this.waitingResponse = true;
    this.notMatched = false;
    this.value = {};
    this.categories = [];
    this._changeDetector.markForCheck();
  }

  private _finalize(): void {
    this._ngZone.run(() => {
      this.waitingResponse = false;
      this._changeDetector.markForCheck();
    });
  }

  private _setValueToFirestore(path: string, value: object): void {
    if (!path || !value) { console.warn('cancel'); return; }

    this._firestore.collection('workbook-quizzes').doc(path).set(value);
  }

  getAllListData(): Promise<void> {
    this._initialize();

    return this._ngZone.runOutsideAngular(() => {
      return this._firestore.collection(this._collectionPath)
        .orderBy('index', this.sortDirection).get()
        .then((result) => {
          if (result.empty) {
            this.notMatched = true;

          } else {
            result.forEach((value) => this.distributeData(value.data() as any));
          }
        })
        .then(() => this._finalize());
    });
  }

  getSearchedListData(searchWords: string[]): Promise<void> {
    this._initialize();

    return this._ngZone.runOutsideAngular(() => {
      // tslint:disable-next-line:max-line-length
      let query = this._firestore.collection(this._collectionPath) as Query;

      searchWords.forEach((word) => {
        query = query.where(`searchToken.${word}`, '==', true);
      });

      return query.get()
        .then((result) => {
          if (result.empty) {
            this.notMatched = true;
          } else {
            result.forEach((res) => {
              this.distributeData(res.data() as D);
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

export const ascIndexSort = (array: { index: number }[]) => {
  array.sort((x, y) => x.index > y.index ? 1 : -1);
};

export const descIndexSort = (array: { index: number }[]) => {
  array.sort((x, y) => x.index > y.index ? -1 : 1);
};

