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
const wsUser_1 = __importDefault(require("../websocket/wsUser"));
const group_1 = __importDefault(require("../models/group"));
/** ChatUser is a individual connection from client -> server to chat. */
class ChatUser extends wsUser_1.default {
    /** handle a chat: broadcast to room. */
    handleChat(text, avatarUrl) {
        if (text !== "") {
            this.room.broadcast({
                username: this.name,
                type: "chat",
                text,
                avatarUrl,
            });
        }
    }
    welcomeMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const { title } = yield group_1.default.getById(this.room.id);
            this.send({ type: "system", text: `Welcome to ${title} chatroom.` });
        });
    }
    /** Handle messages from client:
     *
     * - {type: "chat", text: msg }     : chat
     */
    handleMessage(jsonData) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = JSON.parse(jsonData);
            if (msg.type === "join") {
                yield this.handleJoin(msg.token);
            }
            if (!this.verified)
                return;
            switch (msg.type) {
                case "join":
                    this.welcomeMessage();
                    break;
                case "chat":
                    this.handleChat(msg.text, msg.avatarUrl);
                    break;
                default:
                    break;
            }
        });
    }
}
exports.default = ChatUser;
//# sourceMappingURL=chatuser.js.map