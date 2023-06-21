import Room from "../../websocket/room";
import axios from "axios";
import _ from "lodash";
import TriviaUser from "./triviauser";

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
  round: number = 0;

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
  }

  formatScores() {
    const s: { [name: string]: number } = {};
    for (let user of this.scores) {
      s[user[0].name] = user[1];
    }
    return s;
  }

  /** Gets the initial set of questions and sends them */
  async startGame() {
    this.started = true;
    this.questions = await getQuestions(roundDifficulty[this.round]);
    this.broadcastQuestion();
  }

  /** Ends game and sends final results */
  endGame() {
    this.round = 0;
    this.currentQuestion = 0;
    this.started = false;

    this.broadcast({ type: "final", scores: this.formatScores() });
  }

  /** Increments the round counter and gets new questions, ends game if last round */
  async nextRound() {
    this.round += 1;
    if (this.round < 3) {
      this.broadcast({ type: "nextRound", round: this.round + 1 });
      this.questions = this.questions = await getQuestions(
        roundDifficulty[this.round]
      );
      this.currentQuestion = 0;
      this.broadcastQuestion();
    } else {
      this.endGame();
    }
  }

  /** Increments the question counter and sends the next question to clients, next round if last question */
  nextQuestion() {
    this.currentQuestion += 1;
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
    //console.log(currQ);

    for (let user of this.members) {
      const answer = this.userAnswers.get(user);
      if (currQ.answers[answer]) {
        this.scores.set(user, this.scores.get(user) + 100 * (this.round + 1));
      }
      user.send({
        type: "result",
        correct: currQ.answers[answer] || false,
        correctAnswer: currQ.correctAnswer,
        scores: this.formatScores(),
      });
    }

    this.nextQuestion();
  }

  /** Sets a user's answer */
  submitAnswer(user: TriviaUser, answer: string) {
    if (!this.userAnswers.has(user)) {
      this.userAnswers.set(user, answer);
    }

    if (this.userAnswers.size === this.members.size) {
      this.getResults();
    }
  }
}

export default TriviaRoom;
