import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { noop } from '@material-lite/angular-cdk/utils';
import { MlSlideToggleChange } from '@material-lite/angular/slide-toggle';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';
import { RootHeader } from 'src/app/root-header.service';
import { RootMain } from 'src/app/root-main.service';
import { Firestore, FIRESTORE } from 'src/app/service/firestore';
import { Fragment } from 'src/app/service/fragment';
import { ascIndexSort } from 'src/app/service/list-data-session';
import { MediaQueryObserver } from 'src/app/service/media-query';
import { WorkbookData, WORKBOOK_CURRENT_DATA } from '../workbook';

interface CommonGameConfig {
  mix: boolean;
  repeatCount: number;
  hasSound: boolean;
}

interface Question {
  index: number;
  title: string;
  answers: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
}

type Quiz = {
  [key: string]: Question[]
};


interface Counts {
  answered: number;
  corrected: number;
  mistaken: number;
}
type Counter = {
  total: Counts;
  [key: string]: Counts;
};


@Component({
  selector: 'app-workbook-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class WorkbookGameComponent implements OnDestroy {
  @ViewChild('rootHeaderContent', {static: true})
  private set _onSetRootHeaderContent(templateRef: TemplateRef<any>){
    this._rootHeader.content = templateRef;
  }

  hasLoaded: boolean;

  isPlaying: boolean;
  playingScreenClass: string;

  quiz: Quiz;
  data: WorkbookData;
  gameIdentifiers: [number, string][] = [];

  readonly config: CommonGameConfig = {
    mix: false,
    hasSound: true,
    repeatCount: 0
  };

  readonly localConfig: {
    [key: string]: {
      random: boolean;
      disabled: boolean;
    };
  } = {};

  questionOrderIndexesRef: {[key: string]: number[]} = {};

  questionOrderIndexes: number[];
  questionLength: number;

  // ゲームで遊ばれているデータ
  currentQuestion: Question | null;
  currentAnsweredIndex: number | null;
  currentGameData: WorkbookData['games'][number] | null;

  // 初めは存在しない
  counter: Counter;
  shadeAnsweredCount: number;

  mistakeQuestionIndexes: number[] = [];

  repeatedCount: number;

  playBuzzer: PlayBuzzer = playBuzzer;

  fragmentSubscription: Subscription;

  hasOpenedDialog: boolean;
  dialogsData: {
    type: string;
    content: string;
  }[] = [];

  private _startGame: () => void = this._playFromBeginning.bind(this);

  private _mediaQueryChangesSubscription: Subscription;

  constructor(
    public fragment: Fragment,
    public mediaQuery: MediaQueryObserver,
    private _rootHeader: RootHeader,
    private _rootMain: RootMain,
    @Inject(FIRESTORE) firestore: Firestore,
    changeDetectorRef: ChangeDetectorRef,
    ngZone: NgZone
  ) {
    _rootHeader.styling.setTheme('primary');
    _rootHeader.switchNormalMode();
    _rootHeader.onMpWrapperClick = () => noop;

    const currentData = WORKBOOK_CURRENT_DATA.current;

    // "path" と "dataGetter" は直下の条件文で代入される。
    let path: string;
    let dataGetter: {
      get: (() => Promise<any>) | (() => any);
    };

    if (currentData) {
      path = currentData.pathname;
      this.data = currentData;

      dataGetter = {
        get: noop
      }; // noop

    } else {
      const paths = location.pathname.split('/');
      path = paths[paths.length - 1];

      dataGetter = firestore.collection('workbook-data').doc(path);
    }

    this._mediaQueryChangesSubscription =
      mediaQuery.store.changes.subscribe(changeDetectorRef.markForCheck.bind(changeDetectorRef));

    ngZone.runOutsideAngular(() => {
      Promise.all([
        dataGetter.get(),
        firestore.collection('workbook-quizzes').doc(path).get()
      ]).then(result => {
        const quiz = this.quiz = result[1].data() as Quiz;

        // すでに取得しているデータがあるということは "result[0] = null" であることが確定する。
        const workbookData = this.data || (this.data = result[0].data()) as WorkbookData;

        this.hasLoaded = false;

        const gamesData = workbookData.games;

        ascIndexSort(gamesData);

        let offset = 0;

        const forLen = gamesData.length;
        for (let i = 0; i < forLen; i++) {
          const data = gamesData[i];

          const type = data.type;

          this.localConfig[type] = {
            disabled: false,
            random: false
          };

          const dialogContent = data.dialogContent;
          if (dialogContent) {
            this.dialogsData.push({
              type, content: dialogContent
            });
          }

          const length = quiz[type].length;

          this.questionOrderIndexesRef[data.type] = Array.from({ length }, (_, n) => n + offset);

          offset += length;
          this.gameIdentifiers[i] = [offset - 1, type];
        }

        _rootHeader.onMpWrapperClick = () => this.fragment.add('playing');

        ngZone.run(() => changeDetectorRef.markForCheck());
      });
    });

    this.fragment.remove();

    this.fragmentSubscription = fragment.observe('playing', {
      onMatch: () => {
        if (this.data) {
          this._startGame();
          changeDetectorRef.markForCheck();
        }
      },
      onEndMatching: () => {
        this._getResults();
        changeDetectorRef.markForCheck();
      },
      pipeParams: [skip(1)]
    });
  }

  ngOnDestroy(): void {
    this._rootHeader.styling.setTheme(null);
    this._rootMain.hasHiddenMpNav = false;

    this.fragmentSubscription.unsubscribe();
    this._mediaQueryChangesSubscription.unsubscribe();

    WORKBOOK_CURRENT_DATA.current = null;

    this.fragment.remove();
  }

  startGame(replayOnlyMistakes?: boolean): void {
    this._startGame = replayOnlyMistakes
      ? this._replayOnlyMistakes.bind(this)
      : this._playFromBeginning.bind(this);

    this.fragment.add('playing');
  }

  private _playFromBeginning(): void {
    if (this.isPlaying) { return; }
    this.isPlaying = true;

    const orderIndexes = this.questionOrderIndexes
      = this.questionOrderIndexesFactory();

    this.questionLength = orderIndexes.length;

    this._initGame();
  }

  private _replayOnlyMistakes(): void {
    if (this.isPlaying) { return; }
    this.isPlaying = true;

    const orderIndexes =
      this.questionOrderIndexes = this.mistakeQuestionIndexes;

    this.questionLength = orderIndexes.length;

    this._initGame();
  }

  private _initGame(): void {
    const counter = this.counter = {
      total: {
        answered: 0, // <= nextQuestionを呼び出す際に、この値に１追加するため
        corrected: 0,
        mistaken: 0
      }
    } as Counter;

    const gamesData = this.gameIdentifiers;
    const gameDataLen = gamesData.length;
    for (let i = 0; i < gameDataLen; i++) {
      counter[gamesData[i][1]] = {
        answered: 0,
        corrected: 0,
        mistaken: 0
      };
    }

    this.mistakeQuestionIndexes = [];

    this._nextQuestion();

    const rootHeader = this._rootHeader;
    rootHeader.switchToolbarMode();
    rootHeader.styling.setTheme(null);
    this._rootMain.hasHiddenMpNav = true;
  }

  // 答えのボタンを押すと次の
  onClickAnswerButton(answerIndex: number): void {
    // const answeredIndex = this.currentAnsweredIndex;
    const answeredIndex = this.currentAnsweredIndex;

    const correctAnswerIndex = this.currentQuestion!.correctAnswerIndex;

    if (!(answeredIndex || answeredIndex === 0)) {
      // まだ回答されていないとき
      // 順序は、こっちの処理のほうが早く実行される
      this.currentAnsweredIndex = answerIndex;

      let entryPlayingScreenClass: string;

      const counter = this.counter;
      counter.total.answered++;

      if (correctAnswerIndex === answerIndex) {
        // 正解
        this.playBuzzer.correct();

        counter.total.corrected++;
        counter[this.currentGameData!.type!].corrected++;

        entryPlayingScreenClass = 'answered correct';
        this._rootHeader.styling.setTheme('secondary');

      } else {
        // 不正解
        this.playBuzzer.mistake();

        counter.total.mistaken++;
        counter[this.currentGameData!.type!].mistaken++;

        entryPlayingScreenClass = 'answered mistake';
        this._rootHeader.styling.setTheme('warn');

        const currIndex = this.questionOrderIndexes[counter.total.answered];
        this.mistakeQuestionIndexes.push(currIndex);
      }

      this.playingScreenClass =
        entryPlayingScreenClass + ' correct-' + correctAnswerIndex;

    } else {
      // 回答してあるとき

      // 押されたボタンが答えのボタンか判別する
      if (correctAnswerIndex === answerIndex) {
        this.questionLength === this.counter.total.answered
          ? this._finishQuestion()
          : this._nextQuestion();
      }
    }
  }

  private _nextQuestion(): void {
    this.playingScreenClass = '';
    this._rootHeader.styling.setTheme(null);

    const answeredCount = this.counter.total.answered;
    this.shadeAnsweredCount = answeredCount + 1;

    let nextIndex = this.questionOrderIndexes[answeredCount];

    const identifiers = this.gameIdentifiers;
    const maxLen = identifiers.length - 1;

    let count = 0;
    while (count < maxLen) {
      const _id = identifiers[count];

      if (nextIndex <= _id[0]) {
        break;
      }

      count++;
    }

    const id = identifiers[count];
    const prevId = identifiers[count - 1];
    if (prevId) {
      nextIndex = nextIndex - prevId[0] - 1;
    }

    this.currentGameData = this.data.games[count];
    this.currentQuestion = this.quiz[id[1]][nextIndex];
    this.currentAnsweredIndex = null;
  }

  private _finishQuestion(): void {
    if (this.config.repeatCount >= this.repeatedCount) {
      this.repeatedCount++;
      this._playFromBeginning();

    } else {
      this._getResults();
    }
  }

  private _getResults(): void {
    if (!this.isPlaying) { return; }
    this.isPlaying = false;

    this._startGame = this._playFromBeginning.bind(this);
    this.fragment.remove();

    this.currentQuestion = null;
    this.currentAnsweredIndex = null;
    this.currentGameData = null;

    const rootHeader = this._rootHeader;
    rootHeader.switchNormalMode();
    rootHeader.styling.setTheme('accent');
    this._rootMain.hasHiddenMpNav = false;

    this.isPlaying = false;
  }

  questionOrderIndexesFactory(): number[] {
    const gamesData = this.data.games;

    const conf = this.config;

    let entryIndexes: number[] = [];

    if (conf.mix) {
      const len = gamesData.length;
      for (let i = 0; i < len; i++) {
        const type = gamesData[i].type;

        if (!this.localConfig[type].disabled) {
          entryIndexes = entryIndexes.concat(this.questionOrderIndexesRef[type]);
        }
      }

      return shuffleArray(entryIndexes);


    } else {
      const len = gamesData.length;
      for (let i = 0; i < len; i++) {
        const type = gamesData[i].type;

        const localConf = this.localConfig[type];
        if (!localConf.disabled) {
          const indexes = this.questionOrderIndexesRef[type];
          const v = localConf.random ? shuffleArray(indexes) : indexes;
          entryIndexes = entryIndexes.concat(v);
        }
      }

      return entryIndexes;
    }
  }

  setSound(isEnable: boolean): void {
    this.playBuzzer = isEnable
      ? playBuzzer
      : noopBuzzer;
  }

  onChangeDisabledConfig(event: MlSlideToggleChange, type: string): void {
    const localConfig = this.localConfig;
    this.localConfig[type].disabled = event.checked;

    this.gameIdentifiers.every(id => localConfig[id[1]].disabled)
      ? this._rootHeader.styling.setTheme('disabled')
      : this.counter
        ? this._rootHeader.styling.setTheme('accent')
        : this._rootHeader.styling.setTheme('primary');
  }
}

function shuffleArray([...array]: any[]): number[] {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

interface PlayBuzzer {
  correct: () => any;
  mistake: () => any;
}
const playBuzzer: PlayBuzzer = {} as any;
const noopBuzzer: PlayBuzzer = {
  correct: noop,
  mistake: noop
};

/** [開始] playBuzzerへの代入処理 */
let _buzzer = new Audio('../../../../assets/correct-buzzer.mp3');
playBuzzer.correct = _buzzer.play.bind(_buzzer);

_buzzer = new Audio('../../../../assets/mistake-buzzer.mp3');
playBuzzer.mistake = _buzzer.play.bind(_buzzer);

_buzzer = null!;
/** [終了] playBuzzerへの代入処理 */

