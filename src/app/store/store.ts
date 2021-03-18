import { Observable, Subject } from 'rxjs';

type ActionType = {
  [key: string]: any;
} | string;

// Actionのタイプを
type Action<A extends ActionType> = A extends string
  ? { type: A }
  : { [key in keyof A]: A[key] extends null | undefined
    ? { type: key }
    : { type: key, payload: A[key] }
  }[keyof A];

type Reducer<S, A> = (state: S, action: Action<A>) => S;
interface InitialStore<S, A extends ActionType, IS> {
  state?: IS;
  reducer: Reducer<S, A>;
}

interface StoreConfig<SJ> {
  subject?: SJ;
  deepCopy?: <T>(obj: T) => T;
}

/**
 * @generics `S = state`  `A = action`  `SJ = subject`  IS = `initial state (Don't set)`
 */
export class Store<S, A extends ActionType, SJ extends Subject<S> = Subject<S>, IS extends S = S> {
  private _subject: SJ;
  readonly changes: Observable<S>;

  readonly state: S;
  private _reducer: Reducer<S, A>;

  readonly lastEnteredActionType: Action<A>;

  private _deepCopy: <T>(obj: T) => T;

  constructor(store: InitialStore<S, A, IS>, config: StoreConfig<SJ> = {}) {
    // @ts-ignore: assign the readonly variable
    this._state = store.state;
    this._reducer = store.reducer;

    const sj = this._subject = config.subject
      ? config.subject
      : new Subject() as SJ;

    this.changes = sj.asObservable();

    this._deepCopy = config.deepCopy || noop;
  }

  dispatch(type: Action<A>): void {
    const newState = this._reducer(this.state, type);

    this._subject.next(this._deepCopy(newState));

    // @ts-ignore: assign the readonly variable
    this._state = newState;

    // @ts-ignore: assign the readonly variable
    this.lastEnteredActionType = type;
  }
}

const noop = <T>(arg: T) => arg;
