import WSUser from "../websocket/wsUser";
import Group from "../models/group";

/** ChatUser is a individual connection from client -> server to chat. */
class ChatUser extends WSUser {
  /** handle a chat: broadcast to room. */
  handleChat(text: string, avatarUrl: string) {
    if (text !== "") {
      this.room.broadcast({
        username: this.name,
        type: "chat",
        text,
        avatarUrl,
      });
    }
  }

  async welcomeMessage() {
    const { title } = await Group.getById(this.room.id);
    this.send({ type: "system", text: `Welcome to ${title} chatroom.` });
  }

  /** Handle messages from client:
   *
   * - {type: "chat", text: msg }     : chat
   */
  async handleMessage(jsonData: any) {
    const msg = JSON.parse(jsonData);

    if (msg.type === "join") {
      await this.handleJoin(msg.token);
    }

    if (!this.verified) return;

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
  }
}

export default ChatUser;
