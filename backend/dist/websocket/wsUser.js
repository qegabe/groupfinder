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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const room_1 = __importDefault(require("./room"));
const config_1 = require("../config");
const group_1 = __importDefault(require("../models/group"));
/** WSUser is a individual connection from client -> server to chat. */
class WSUser {
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
    /** handle joining: add to room members */
    handleJoin(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = jsonwebtoken_1.default.verify(token, config_1.SECRET_KEY);
                this.name = user.username;
                if (!(yield group_1.default.isMember(this.room.id, this.name))) {
                    throw Error("Not member of group");
                }
                this.verified = true;
                this.room.join(this);
                this.send({
                    type: "auth",
                    result: true,
                    message: "Successfully verified and joined",
                });
            }
            catch (error) {
                console.error(error);
                this.send({
                    type: "auth",
                    result: false,
                    message: `Failed to verify: ${error.message}`,
                });
            }
        });
    }
    /** Handle messages from client
     */
    handleMessage(jsonData) {
        const msg = JSON.parse(jsonData);
        switch (msg.type) {
            case "join":
                this.handleJoin(msg.token);
                break;
            default:
                break;
        }
    }
    /** Connection was closed: leave room */
    handleClose() {
        this.room.leave(this);
    }
}
exports.default = WSUser;
//# sourceMappingURL=wsUser.js.map