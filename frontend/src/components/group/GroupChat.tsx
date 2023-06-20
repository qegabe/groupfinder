import React, { useEffect, useRef, useState, useMemo, FormEvent } from "react";
import { Avatar, Box, Button, TextField, Typography } from "@mui/material";
import { startWebSocket } from "../../helpers/websocket";
import { useAppSelector } from "../../hooks/redux";
import { useParams } from "react-router-dom";

interface IMessage {
  username: string;
  text: string;
  avatarUrl: string | null;
  type: "chat";
}

function Message({ text, username, avatarUrl }: IMessage) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", my: 0.5 }}>
      <Avatar
        sx={{ width: 20, height: 20, mx: 1 }}
        src={avatarUrl || undefined}
      />
      <Typography sx={{ fontWeight: "bold" }} component="span">
        {username}:
      </Typography>
      <Typography sx={{ ml: 1 }} component="span">
        {text}
      </Typography>
    </Box>
  );
}

function GroupChat() {
  const { id } = useParams();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const [text, setText] = useState("");
  const [messageData, setMessageData] = useState<IMessage[]>([]);

  const ws = useRef<WebSocket>();

  const messageRecieved = useMemo(
    () => (data: any) => {
      const msg = JSON.parse(data);
      if (msg.type === "chat") {
        setMessageData((md) => [...md, msg]);
      }
    },
    []
  );

  useEffect(() => {
    if (!ws.current) {
      ws.current = startWebSocket(
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

  const messages = messageData.map((m, i) => <Message key={i} {...m} />);

  return (
    <Box sx={{ display: "grid", justifyContent: "center", mt: 2 }}>
      <Box sx={{ height: "80vh", boxShadow: 1 }}>{messages}</Box>
      <Box
        component="form"
        sx={{
          width: "50vw",
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
