import { Component, ViewEncapsulation } from '@angular/core';

type Quiz = {
  index: number;
  question: string;
  answers: [any, any, any, any];
  correctAnswerIndex: 0 | 1 | 2 | 3;
}[];

interface WorkbookConfig {
  onlyGeneral: boolean;
  onlyWiringDiagram: boolean;

  random: boolean;
  repeatCount: number;
}

const QUIZ: Quiz = [
  {
    index: 0,
    question: 'じゅんぺいの正しい<span class="bold">年齢</span>は？',
    answers: [17, 18, 19, 20],
    correctAnswerIndex: 0
  },
  {
    index: 1,
    question: '正しい<span class="bold">漢字</span>は？',
    answers: ['順平', '潤平', '淳平', '純平'],
    correctAnswerIndex: 3
  }
];

const CONFIG: WorkbookConfig = {
  onlyGeneral: false,
  onlyWiringDiagram: false,
  random: false,
  repeatCount: 0
};

@Component({
  selector: 'app-workbook',
  templateUrl: './workbook.component.html',
  styleUrls: ['./workbook.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkbookComponent {
  display: 'result' | 'playing' | 'ready' = 'ready';

  playingDisplayClass: string;

  // データベースから取得した"Quiz"を代入する
  quiz: Quiz = QUIZ;

  // データベースから取得した"Userの設定"を代入する
  config: WorkbookConfig = CONFIG;

  // 各問題ごとのデータ（少なければオブジェクトにまとめない）
  currentQuestion: Quiz[number];
  currentAnsweredIndex: number | null;

  // 存在しない場合は、0 => 1 => 2 のように順番通りで進行する
  questionOrderIndexes: number[];
  questionLength: number;

  counter: {
    answered: number;
    correctCount: number;
    mistakeCount: number;
  };

  repeatedCount: number;

  mistakeQuestionIndexes: number[] = [];

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
      } else {
        // 不正解
        entryPlayingDisplayClass = 'answered mistake';
        this.counter.mistakeCount++;
        this.mistakeQuestionIndexes.push(currQues.index);
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
    const quizLen = (this.questionLength = this.quiz.length);
    const numArr = createConsecutiveArray(quizLen);

    if (this.config.random) {
      shuffleArray(numArr);
      this.questionOrderIndexes = numArr;
    } else {
      this.questionOrderIndexes = numArr;
    }

    console.log(this.questionOrderIndexes, 'test');
    this.start();
  }

  replayOnlyMistakes(): void {
    // 重複した値を削除する
    const mistakes = this.mistakeQuestionIndexes;
    const indexes = (this.questionOrderIndexes = mistakes.filter(
      (val, i) => i === mistakes.indexOf(val)
    ));

    this.questionLength = indexes.length;

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
}

function createConsecutiveArray(length: number): number[] {
  return [...(Array(length).keys() as any)] as number[];
}

function shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
