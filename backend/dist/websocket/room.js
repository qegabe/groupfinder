"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// in-memory storage of roomNames -> room
const ROOMS = new Map();
/** Room is a collection of listening members; this becomes a "chat room"
 *   where individual users can join/leave/broadcast to.
 */
class Room {
    static get(roomId) {
        if (!ROOMS.has(roomId)) {
            ROOMS.set(roomId, new Room(roomId));
        }
        return ROOMS.get(roomId);
    }
    /** make a new room, starting with empty set of listeners */
    constructor(roomId) {
        this.id = roomId;
        this.members = new Set();
    }
    /** member joining a room. */
    join(member) {
        this.members.add(member);
    }
    /** member leaving a room. */
    leave(member) {
        this.members.delete(member);
    }
    /** send message to all members in a room. */
    broadcast(data) {
        for (let member of this.members) {
            if (member.verified) {
                member.send(JSON.stringify(data));
            }
        }
    }
}
exports.default = Room;
//# sourceMappingURL=room.js.map