"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wsUser_1 = __importDefault(require("../websocket/wsUser"));
/** ChatUser is a individual connection from client -> server to chat. */
class ChatUser extends wsUser_1.default {
    /** handle a chat: broadcast to room. */
    handleChat(text, avatarUrl) {
        this.room.broadcast({
            username: this.name,
            type: "chat",
            text,
            avatarUrl,
        });
    }
    /** Handle messages from client:
     *
     * - {type: "chat", text: msg }     : chat
     */
    handleMessage(jsonData) {
        const msg = JSON.parse(jsonData);
        if (msg.type === "join") {
            this.handleJoin(msg.token);
            return;
        }
        if (!this.verified)
            return;
        switch (msg.type) {
            case "chat":
                this.handleChat(msg.text, msg.avatarUrl);
                break;
            default:
                break;
        }
    }
}
exports.default = ChatUser;
//# sourceMappingURL=chatuser.js.map