"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const room_1 = __importDefault(require("./room"));
const config_1 = require("../config");
/** ChatUser is a individual connection from client -> server to chat. */
class ChatUser {
    /** make chat: store connection-device, room */
    constructor(send, roomId) {
        this.verified = false;
        this._send = send; // "send" function for this user
        this.room = room_1.default.get(roomId);
        this.name = null;
    }
    /** send msgs to this client using underlying connection-send-function */
    send(data) {
        try {
            if (data instanceof Object)
                data = JSON.stringify(data);
            this._send(data);
        }
        catch (e) {
            console.error(e);
        }
    }
    /** handle joining: add to room members, announce join */
    handleJoin(token) {
        try {
            const user = jsonwebtoken_1.default.verify(token, config_1.SECRET_KEY);
            this.name = user.username;
            this.verified = true;
            this.room.join(this);
            this.send({ type: "system", result: "Successfully verified and joined" });
        }
        catch (error) {
            console.error(error);
            this.send({ type: "system", result: "Failed to verify" });
        }
    }
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
        switch (msg.type) {
            case "join":
                this.handleJoin(msg.token);
                break;
            case "chat":
                this.handleChat(msg.text, msg.avatarUrl);
                break;
            default:
                throw new Error(`bad message: ${msg.type}`);
        }
    }
    /** Connection was closed: leave room */
    handleClose() {
        this.room.leave(this);
    }
}
exports.default = ChatUser;
//# sourceMappingURL=chatuser.js.map