import ws from "ws";
import WSUser from "../../websocket/wsUser";
import TriviaRoom from "./triviaroom";

class TriviaUser extends WSUser {
  room: TriviaRoom;

  constructor(send: ws["send"], roomId: number) {
    super(send, roomId);
    this.room = TriviaRoom.get(roomId);
  }

  /** Handle messages from client:
   */
  handleMessage(jsonData: any) {
    const msg = JSON.parse(jsonData);

    if (msg.type === "join") {
      this.handleJoin(msg.token);
      return;
    }

    if (!this.verified) return;

    switch (msg.type) {
      case "start":
        if (!this.room.started) {
          this.room.startGame();
        }
        break;
      case "answer":
        this.room.submitAnswer(this, msg.answer);
        break;
      default:
        break;
    }
  }
}

export default TriviaUser;
