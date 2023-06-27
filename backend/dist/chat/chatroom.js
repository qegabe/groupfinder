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
const room_1 = __importDefault(require("../websocket/room"));
const group_1 = __importDefault(require("../models/group"));
// in-memory storage of roomNames -> room
const CHAT_ROOMS = new Map();
/** Room is a collection of listening members; this becomes a "chat room"
 *   where individual users can join/leave/broadcast to.
 */
class ChatRoom extends room_1.default {
    static get(roomId) {
        if (!CHAT_ROOMS.has(roomId)) {
            CHAT_ROOMS.set(roomId, new ChatRoom(roomId));
        }
        return CHAT_ROOMS.get(roomId);
    }
    join(member) {
        return __awaiter(this, void 0, void 0, function* () {
            this.members.add(member);
            if (!this.title) {
                const group = yield group_1.default.getById(this.id);
                this.title = group.title;
            }
        });
    }
}
exports.default = ChatRoom;
//# sourceMappingURL=chatroom.js.map