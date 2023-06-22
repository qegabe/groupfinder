"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wsUser_1 = __importDefault(require("../../websocket/wsUser"));
const triviaroom_1 = __importDefault(require("./triviaroom"));
class TriviaUser extends wsUser_1.default {
    constructor(send, roomId) {
        super(send, roomId);
        this.room = triviaroom_1.default.get(roomId);
    }
    /** Handle messages from client:
     */
    handleMessage(jsonData) {
        const msg = JSON.parse(jsonData);
        if (msg.type === "join") {
            this.handleJoin(msg.token);
            this.room.sendState(this);
            return;
        }
        if (!this.verified)
            return;
        switch (msg.type) {
            case "start":
                if (!this.room.started) {
                    this.room.startGame();
                }
                break;
            case "end":
                if (this.room.started) {
                    this.room.endGame();
                }
                break;
            case "answer":
                this.room.submitAnswer(this, msg.answer);
                break;
            case "next":
                if (this.room.started) {
                    this.room.nextQuestion();
                }
                break;
            case "restart":
                this.room.restartGame();
                break;
            default:
                break;
        }
    }
}
exports.default = TriviaUser;
//# sourceMappingURL=triviauser.js.map