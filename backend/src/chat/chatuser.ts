import ws from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import Room from "./room";
import { SECRET_KEY } from "../config";

/** ChatUser is a individual connection from client -> server to chat. */
class ChatUser {
  _send: ws["send"];
  room: Room;
  name: string;
  verified: boolean = false;

  /** make chat: store connection-device, room */
  constructor(send: ws["send"], roomId: number) {
    this._send = send; // "send" function for this user
    this.room = Room.get(roomId);
    this.name = null;
  }

  /** send msgs to this client using underlying connection-send-function */
  send(data: any) {
    try {
      if (data instanceof Object) data = JSON.stringify(data);
      this._send(data);
    } catch (e) {
      console.error(e);
    }
  }

  /** handle joining: add to room members, announce join */
  handleJoin(token: string) {
    try {
      const user = jwt.verify(token, SECRET_KEY);
      this.name = (user as JwtPayload).username;
      this.verified = true;
      this.room.join(this);
      this.send({ type: "system", result: "Successfully verified and joined" });
    } catch (error) {
      console.error(error);
      this.send({ type: "system", result: "Failed to verify" });
    }
  }

  /** handle a chat: broadcast to room. */
  handleChat(text: string, avatarUrl: string) {
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
  handleMessage(jsonData: any) {
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

export default ChatUser;
