import WSUser from "../websocket/wsUser";

/** ChatUser is a individual connection from client -> server to chat. */
class ChatUser extends WSUser {
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

    if (msg.type === "join") {
      this.handleJoin(msg.token);
      return;
    }

    if (!this.verified) return;

    switch (msg.type) {
      case "chat":
        this.handleChat(msg.text, msg.avatarUrl);
        break;
      default:
        break;
    }
  }
}

export default ChatUser;
