import Room from "../../websocket/room";
import axios from "axios";
import _ from "lodash";
import TriviaUser from "./triviauser";
import User from "../../models/user";

const TRIVIA_ROOMS = new Map<number, TriviaRoom>();

const BASE_URL = "https://the-trivia-api.com/v2";

interface Question {
  question: string;
  answers: {
    [answer: string]: boolean;
  };
  correctAnswer: string;
  category: string;
}

const roundDifficulty = ["easy", "medium", "hard"];

async function getQuestions(difficulty: string) {
  const resp = await axios({
    url: `${BASE_URL}/questions`,
    params: {
      limit: 5,
      difficulties: difficulty,
      types: "text_choice",
    },
  });
  const questions = [];
  for (let q of resp.data) {
    const question = {
      question: q.question.text,
      answers: {
        [q.correctAnswer]: true,
        [q.incorrectAnswers[0]]: false,
        [q.incorrectAnswers[1]]: false,
        [q.incorrectAnswers[2]]: false,
      },
      correctAnswer: q.correctAnswer,
      category: q.category,
    };
    questions.push(question);
  }
  return questions;
}

class TriviaRoom extends Room {
  started: boolean = false;
  members: Set<TriviaUser>;
  questions: Question[] = [];
  currentQuestion: number = 0;
  userAnswers = new Map<TriviaUser, string>();
  scores = new Map<TriviaUser, number>();
  round: number = -1;
  sentResults: boolean = false;
  questionTimeOut: NodeJS.Timeout;

  /** Gets a room if it exists otherwise creates a new room */
  static get(roomId: number) {
    if (!TRIVIA_ROOMS.has(roomId)) {
      TRIVIA_ROOMS.set(roomId, new TriviaRoom(roomId));
    }

    return TRIVIA_ROOMS.get(roomId);
  }

  /** Joins a room and adds them to the scores if not already there */
  join(member: TriviaUser): void {
    this.members.add(member);
    if (!this.scores.has(member)) {
      this.scores.set(member, 0);
    }
  }

  /** Sends a question to all clients */
  broadcastQuestion() {
    const currQ = this.questions[this.currentQuestion];

    const question = {
      question: currQ.question,
      answers: _.shuffle(Object.keys(currQ.answers)),
      category: currQ.category,
    };
    this.broadcast({ type: "question", question });
    this.questionTimeOut = setTimeout(() => {
      this.getResults();
    }, 60000);
  }

  formatScores() {
    const s: { [name: string]: number } = {};
    for (let user of this.scores) {
      s[user[0].name] = user[1];
    }
    //console.log(this.scores, s);
    return s;
  }

  /** Gets the initial set of questions and sends them */
  async startGame() {
    this.started = true;
    this.broadcast({ type: "start" });
    this.nextRound();
  }

  /** Resets the game */
  reset() {
    this.round = -1;
    this.questions = [];
    this.currentQuestion = 0;
    this.started = false;
    this.sentResults = false;
    this.scores.clear();
    this.userAnswers.clear();
    clearTimeout(this.questionTimeOut);
  }

  /** Ends game, updates high scores and sends final results */
  async endGame() {
    try {
      for (let user of this.members) {
        await User.updateHighScore(user.name, this.scores.get(user));
      }
    } catch (error) {
      console.error(error);
    }
    this.broadcast({ type: "final", scores: this.formatScores() });
    this.reset();
  }

  restartGame() {
    this.reset();
    this.broadcast({ type: "restart", reason: "restart requested" });
  }

  /** Increments the round counter and gets new questions, ends game if last round */
  async nextRound() {
    try {
      this.round += 1;
      if (this.round < 3) {
        this.broadcast({ type: "nextRound", round: this.round + 1 });
        this.questions = this.questions = await getQuestions(
          roundDifficulty[this.round]
        );
        this.currentQuestion = 0;
        setTimeout(() => {
          this.broadcastQuestion();
        }, 2000);
      } else {
        this.endGame();
      }
    } catch (error) {
      console.error(error);
      this.broadcast({ type: "restart", reason: `error: ${error}` });
    }
  }

  /** Increments the question counter and sends the next question to clients, next round if last question */
  nextQuestion() {
    this.currentQuestion += 1;
    this.sentResults = false;
    this.userAnswers.clear();
    if (this.currentQuestion < this.questions.length) {
      this.broadcastQuestion();
    } else {
      this.nextRound();
    }
  }

  /** Checks all user's answers and increase score if correct, send results to clients */
  getResults() {
    const currQ = this.questions[this.currentQuestion];

    for (let user of this.members) {
      const answer = this.userAnswers.get(user);
      if (currQ.answers[answer]) {
        this.scores.set(user, this.scores.get(user) + 100 * (this.round + 1));
      }
    }
    this.sentResults = true;
    this.broadcast({
      type: "result",
      correctAnswer: currQ.correctAnswer,
      scores: this.formatScores(),
    });
  }

  /** Sets a user's answer */
  submitAnswer(user: TriviaUser, answer: string) {
    if (!this.userAnswers.has(user)) {
      this.userAnswers.set(user, answer);
    }

    if (this.userAnswers.size === this.members.size) {
      clearTimeout(this.questionTimeOut);
      this.getResults();
    }
  }

  /** Sends the current game state to a user */
  sendState(user: TriviaUser) {
    const currQ = this.questions[this.currentQuestion];

    let question;
    if (currQ) {
      question = {
        question: currQ.question,
        answers: _.shuffle(Object.keys(currQ.answers)),
        category: currQ.category,
      };
    }

    const state = {
      type: "gameState",
      question,
      correctAnswer: this.sentResults ? currQ.correctAnswer : undefined,
      scores: this.formatScores(),
      round: this.round,
      started: this.started,
    };

    user.send(state);
  }
}

export default TriviaRoom;
