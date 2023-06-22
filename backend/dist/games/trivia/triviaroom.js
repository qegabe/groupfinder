"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const room_1 = __importDefault(require("../../websocket/room"));
const axios_1 = __importDefault(require("axios"));
const lodash_1 = __importDefault(require("lodash"));
const TRIVIA_ROOMS = new Map();
const BASE_URL = "https://the-trivia-api.com/v2";
const roundDifficulty = ["easy", "medium", "hard"];
function getQuestions(difficulty) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield (0, axios_1.default)({
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
    });
}
class TriviaRoom extends room_1.default {
    constructor() {
        super(...arguments);
        this.started = false;
        this.questions = [];
        this.currentQuestion = 0;
        this.userAnswers = new Map();
        this.scores = new Map();
        this.round = 0;
        this.sentResults = false;
    }
    /** Gets a room if it exists otherwise creates a new room */
    static get(roomId) {
        if (!TRIVIA_ROOMS.has(roomId)) {
            TRIVIA_ROOMS.set(roomId, new TriviaRoom(roomId));
        }
        return TRIVIA_ROOMS.get(roomId);
    }
    /** Joins a room and adds them to the scores if not already there */
    join(member) {
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
            answers: lodash_1.default.shuffle(Object.keys(currQ.answers)),
            category: currQ.category,
        };
        this.broadcast({ type: "question", question });
    }
    formatScores() {
        const s = {};
        for (let user of this.scores) {
            s[user[0].name] = user[1];
        }
        return s;
    }
    /** Gets the initial set of questions and sends them */
    startGame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.started = true;
            this.broadcast({ type: "start" });
            this.questions = yield getQuestions(roundDifficulty[this.round]);
            this.broadcastQuestion();
        });
    }
    /** Resets the game */
    reset() {
        this.round = 0;
        this.questions = [];
        this.currentQuestion = 0;
        this.started = false;
        this.sentResults = false;
        this.scores.clear();
        this.userAnswers.clear();
    }
    /** Ends game and sends final results */
    endGame() {
        this.broadcast({ type: "final", scores: this.formatScores() });
        this.reset();
    }
    restartGame() {
        this.reset();
        this.broadcast({ type: "restart" });
    }
    /** Increments the round counter and gets new questions, ends game if last round */
    nextRound() {
        return __awaiter(this, void 0, void 0, function* () {
            this.round += 1;
            if (this.round < 3) {
                this.broadcast({ type: "nextRound", round: this.round + 1 });
                this.questions = this.questions = yield getQuestions(roundDifficulty[this.round]);
                this.currentQuestion = 0;
                this.broadcastQuestion();
            }
            else {
                this.endGame();
            }
        });
    }
    /** Increments the question counter and sends the next question to clients, next round if last question */
    nextQuestion() {
        this.currentQuestion += 1;
        this.sentResults = false;
        this.userAnswers.clear();
        if (this.currentQuestion < this.questions.length) {
            this.broadcastQuestion();
        }
        else {
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
    submitAnswer(user, answer) {
        if (!this.userAnswers.has(user)) {
            this.userAnswers.set(user, answer);
        }
        if (this.userAnswers.size === this.members.size) {
            this.getResults();
        }
    }
    /** Sends the current game state to a user */
    sendState(user) {
        const currQ = this.questions[this.currentQuestion];
        let question;
        if (currQ) {
            question = {
                question: currQ.question,
                answers: lodash_1.default.shuffle(Object.keys(currQ.answers)),
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
exports.default = TriviaRoom;
//# sourceMappingURL=triviaroom.js.map