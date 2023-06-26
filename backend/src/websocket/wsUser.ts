import ws from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import Room from "./room";
import { SECRET_KEY } from "../config";
import Group from "../models/group";

/** WSUser is a individual connection from client -> server to chat. */
class WSUser {
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

  /** handle joining: add to room members */
  async handleJoin(token: string) {
    try {
      const user = jwt.verify(token, SECRET_KEY);
      this.name = (user as JwtPayload).username;
      if (!(await Group.isMember(this.room.id, this.name))) {
        throw Error("Not member of group");
      }
      this.verified = true;
      this.room.join(this);
      this.send({
        type: "auth",
        result: true,
        message: "Successfully verified and joined",
      });
    } catch (error) {
      console.error(error);
      this.send({
        type: "auth",
        result: false,
        message: `Failed to verify: ${error.message}`,
      });
    }
  }

  /** Handle messages from client
   */
  handleMessage(jsonData: any) {
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

export default WSUser;
