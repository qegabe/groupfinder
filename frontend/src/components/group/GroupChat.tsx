import React, { useEffect, useRef, useState, useMemo, FormEvent } from "react";
import { Avatar, Box, Button, TextField, Typography } from "@mui/material";
import { startWebSocket } from "../../helpers/websocket";
import { useAppSelector } from "../../hooks/redux";
import { useNavigate, useParams } from "react-router-dom";
import useChatScroll from "../../hooks/useChatScroll";

interface IMessage {
  username?: string;
  text: string;
  style?: string;
  avatarUrl?: string | null;
  showAvatar?: boolean;
  type: "chat";
}

function Message({ text, username, avatarUrl, style, showAvatar }: IMessage) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        my: 0.5,
      }}>
      {showAvatar ? (
        <Avatar
          sx={{ width: 20, height: 20, mx: 1 }}
          src={avatarUrl || undefined}
        />
      ) : null}
      {username ? (
        <Typography sx={{ fontWeight: "bold" }} component="span">
          {username}:
        </Typography>
      ) : null}
      <Typography sx={{ ml: 1, fontStyle: style }} component="span">
        {text}
      </Typography>
    </Box>
  );
}

function GroupChat() {
  const { id } = useParams();
  const { user, token } = useAppSelector((s) => s.auth);
  const [text, setText] = useState("");
  const [messageData, setMessageData] = useState<IMessage[]>([]);
  const ref = useChatScroll(messageData);
  const navigate = useNavigate();

  const ws = useRef<WebSocket>();

  const messageRecieved = useMemo(
    () => (data: any) => {
      const msg = JSON.parse(data);
      if (msg.type === "chat") {
        setMessageData((md) => [...md, msg]);
      } else if (msg.type === "auth" && !msg.result) {
        ws.current?.close();
        ws.current = undefined;
        navigate("/");
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (!ws.current) {
      ws.current = startWebSocket(
        "chat",
        +(id as string),
        token || "",
        messageRecieved
      );
    }
    return () => {
      if (ws.current?.readyState === ws.current?.OPEN) {
        ws.current?.close();
        ws.current = undefined;
      }
    };
  }, [token, id, messageRecieved]);

  function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setText("");
    if (user) {
      ws.current?.send(
        JSON.stringify({
          text,
          username: user.username,
          type: "chat",
          avatarUrl: user.avatarUrl,
        })
      );
    }
  }

  const messages = messageData.map((m, i) => (
    <Message key={i} showAvatar={true} {...m} />
  ));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        my: 2,
        mr: 2,
        border: 1,
        borderColor: "inherit",
        borderRadius: 1,
      }}>
      <Box
        ref={ref}
        sx={{
          boxShadow: 1,
          flexGrow: 3,
          overflowY: "auto",
        }}>
        {messages}
      </Box>
      <Box
        component="form"
        sx={{
          display: "flex",
        }}
        onSubmit={handleSubmit}>
        <TextField
          autoComplete="off"
          fullWidth
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
        <Button variant="contained" type="submit">
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default GroupChat;
