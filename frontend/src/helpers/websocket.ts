const host =
  process.env.NODE_ENV === "production"
    ? window.location.host
    : "localhost:5000";

function startWebSocket(
  path: string,
  id: number,
  token: string,
  onMessageCallback: (data: any) => void
): WebSocket {
  const ws = new WebSocket(`ws://${host}/${path}/${id}`);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", token }));
    //console.log("opened ws connection");
  };

  ws.onclose = (e) => {
    console.log("close ws connection:", e.code, e.reason);
  };

  ws.onmessage = (e) => {
    onMessageCallback(e.data);
  };

  return ws;
}

export { startWebSocket };
