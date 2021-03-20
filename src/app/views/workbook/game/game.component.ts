import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Firestore, FIRESTORE } from 'src/app/service/firestore';
import { Fragment } from 'src/app/service/fragment';
import { RunOutsideNgZone, RUN_NG_ZONE, RUN_OUTSIDE_NG_ZONE } from 'src/app/utils';
import { WorkbookData, WORKBOOK_CURRENT_DATA } from '../workbook';

type GameConfig = GameConfigForDefault | GameConfigForDenko;

interface GameConfigForDefault {
  random: boolean;
  repeatCount: number;
  hasSound: boolean;
}

interface GameConfigForDenko {
  general: {
    random: boolean;
    disabled: boolean;
  };
  wiringDiagram: this['general'];
  mix: boolean;
  repeatCount: number;
  hasSound: boolean;
}

// type WorkbookGameConfig = WorkbookGameConfigForDenko | WorkbookG {
//   general: {
//     random: boolean;
//     disabled: boolean;
//   };
//   wiringDiagram: this['general'];
//   mix: boolean;
//   repeatCount: number;
// }

interface Question {
  index: number;
  title: string;
  answers: [any, any, any, any];
  correctAnswerIndex: 0 | 1 | 2 | 3;
}

type Quiz = Question[];

const QUIZ: Quiz = [
  {
    index: 0,
    title: 'じゅんぺいの正しい<span class="bold">年齢</span>は？',
    answers: [17, 18, 19, 20],
    correctAnswerIndex: 0
  },
  {
    index: 1,
    title: '正しい<span class="bold">漢字</span>は？',
    answers: ['順平', '潤平', '淳平', '純平'],
    correctAnswerIndex: 3
  },
  {
    index: 2,
    title: '正しい<span class="bold">漢字</span>は？',
    answers: ['順平', '潤平', '淳平', '純平'],
    correctAnswerIndex: 3
  }
];

const CONFIG: GameConfigForDenko = {
  general: {
    random: false,
    disabled: false,
  },
  wiringDiagram: {
    random: false,
    disabled: false
  },
  mix: false,
  repeatCount: 0,
  hasSound: true
};

@Component({
  selector: 'app-workbook',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class WorkbookGameComponent implements OnDestroy {
  hasLoaded: boolean;
  display: 'result' | 'playing' | 'ready' = 'ready';

  playingDisplayClass: string;

  // データベースから取得した"Quiz"を代入する
  quiz: Quiz = QUIZ;
  data: WorkbookData;

  config: GameConfig = CONFIG;

  // 各問題ごとのデータ（少なければオブジェクトにまとめない）
  currentQuestion: Quiz[number];
  currentAnsweredIndex: number | null;

  questionOrderIndexes: number[];
  questionLength: number;
  questionOrderIndexesFactory: (config: GameConfig) => number[];

  counter: {
    answered: number;
    correctCount: number;
    mistakeCount: number;
  };

  repeatedCount: number;

  mistakeQuestionIndexes: number[] = [];

  playBuzzer: PlayBuzzer = playBuzzer;

  constructor(
    public fragment: Fragment,
    @Inject(FIRESTORE) firestore: Firestore,
    @Inject(RUN_OUTSIDE_NG_ZONE) runOutsideNgZone: RunOutsideNgZone,
    changeDetectorRef: ChangeDetectorRef
  ) {
    const currentData = WORKBOOK_CURRENT_DATA.current;

    // "path" と "dataGetter" は直下の条件文で代入される。
    let path: string;
    let dataGetter: {
      get: (() => Promise<any>) | (() => null);
    };

    if (currentData) {
      path = currentData.pathname;
      this.data = currentData;
      dataGetter = {
        get: () => null
      }; // noop

    } else {
      const paths = location.pathname.split('/');
      path = paths[paths.length - 1];

      dataGetter = firestore.collection('workbook-data').doc(path);
    }

    runOutsideNgZone(() => {
      Promise.all([
        dataGetter.get(),
        firestore.collection('workbook-quizzes').doc(path).get()
      ]).then(result => {
        // this.quiz = result[1].data().quiz;

        // すでに取得しているデータがあるということは "result[0] = null" であることが確定する。
        const data = this.data || result[0].data() as WorkbookData;

        this.questionOrderIndexesFactory = data.gameType === 'denko'
          ? createOrderIndexesForDenko
          : createOrderIndexesForDefault;

        this.hasLoaded = false;

        changeDetectorRef.markForCheck();
      });
    });

    fragment.observe('playing', {
      onMatch: () => this.play(),
      onEndMatching: () => this.finish()
    });
  }

  // 答えのボタンを押すと次の
  onClickAnswerButton(answerIndex: number): void {
    const answeredIndex = this.currentAnsweredIndex;

    const currQues = this.currentQuestion;
    const correctAnswerIndex = currQues.correctAnswerIndex;

    // 回答するかどうかを判別
    if (answeredIndex === 0 || answeredIndex) {
      // 回答してあるとき

      // 押されたボタンが答えのボタンか判別する
      if (correctAnswerIndex === answerIndex) {
        this.questionLength === this.counter.answered + 1
          ? this.finish()
          : this.nextQuestion();
      }
    } else {
      // 回答されていないとき
      this.currentAnsweredIndex = answerIndex;

      let entryPlayingDisplayClass: string;
      if (correctAnswerIndex === answerIndex) {
        // 正解
        entryPlayingDisplayClass = 'answered correct';
        this.counter.correctCount++;
        this.playBuzzer.correct();

      } else {
        // 不正解
        entryPlayingDisplayClass = 'answered mistake';
        this.counter.mistakeCount++;
        this.mistakeQuestionIndexes.push(currQues.index);
        this.playBuzzer.mistake();

      }

      this.playingDisplayClass =
        entryPlayingDisplayClass + ' correct-' + correctAnswerIndex;
    }
  }

  start(): void {
    this.counter = {
      answered: -1, // <= nextQuestionを呼び出す際に、この値に１追加するため
      correctCount: 0,
      mistakeCount: 0
    };
    this.mistakeQuestionIndexes = [];

    this.nextQuestion();
    this.display = 'playing';
  }

  play(): void {
    const orderIndexes = this.questionOrderIndexes
      = this.questionOrderIndexesFactory(this.config);

    this.questionLength = orderIndexes.length;

    this.start();
  }

  replayOnlyMistakes(): void {
    // 重複した値を削除する
    const mistakes = this.mistakeQuestionIndexes;
    const orderIndexes = (this.questionOrderIndexes =
      mistakes.filter((val, i) => i === mistakes.indexOf(val)));

    this.questionLength = orderIndexes.length;

    this.start();
  }

  nextQuestion(): void {
    this.playingDisplayClass = '';
    const quesOrderIndexes = this.questionOrderIndexes;

    const answeredCount = (this.counter.answered += 1);

    this.currentQuestion = this.quiz[quesOrderIndexes[answeredCount]];
    this.currentAnsweredIndex = null;
  }

  finish(): void {
    if (this.config.repeatCount >= this.repeatedCount) {
      this.repeatedCount++;
      this.play();

    } else {
      this.currentQuestion = null;
      this.currentAnsweredIndex = null;
      this.display = 'result';
    }
  }

  ngOnDestroy(): void {
    WORKBOOK_CURRENT_DATA.current = undefined;
  }
}


interface PlayBuzzer {
  correct: () => Promise<void>;
  mistake: () => Promise<void>;
}
const playBuzzer: PlayBuzzer = {} as any;

/** [開始] playBuzzerへの代入処理 */
let _buzzer = new Audio('../../../../assets/correct-buzzer.mp3');
playBuzzer.correct = _buzzer.play.bind(_buzzer);

_buzzer = new Audio('../../../../assets/mistake-buzzer.mp3');
playBuzzer.mistake = _buzzer.play.bind(_buzzer);

_buzzer = null;
/** [終了] playBuzzerへの代入処理 */

function shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createOrderIndexesForDenko(config: GameConfigForDenko): number[] {
  let entry: number[];

  if (config.mix) {
    // tslint:disable-next-line:max-line-length
    entry = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49];
    shuffleArray(entry);

  } else {
    const generalConf = config.general;
    if (generalConf.disabled) {
      entry = [];
    } else {
      entry = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
      if (generalConf.random) {
        shuffleArray(entry);
      }
    }

    const wdConf = config.wiringDiagram;
    if (!wdConf.disabled) {
      const _arr = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49];
      if (wdConf.random) {
        shuffleArray(_arr);
      }

      entry.concat(_arr);
    }

  }

  return entry;
}

function createOrderIndexesForDefault(config: GameConfigForDefault): number[] {
  const entry = [...Array(60).keys()];

  if (config.random) {
    shuffleArray(entry);
  }

  return entry;
}

