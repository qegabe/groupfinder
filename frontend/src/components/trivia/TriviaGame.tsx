import React, { useRef, useMemo, useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { startWebSocket } from "../../helpers/websocket";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import TriviaQuestion from "./TriviaQuestion";
import GroupFinderApi from "../../api";
import TriviaScores from "./TriviaScores";
import TriviaGameOver from "./TriviaGameOver";
import TriviaRoundTransition from "./TriviaRoundTransition";

interface GameState {
  question: Question | undefined;
  correctAnswer: string | undefined;
  selectedAnswer: number | undefined;
  started: boolean;
  gameOver: boolean;
  round: number;
  showRound: boolean;
  scores: { [username: string]: number };
}

const INITIAL_STATE: GameState = {
  question: undefined,
  correctAnswer: undefined,
  selectedAnswer: undefined,
  started: false,
  gameOver: false,
  round: 0,
  showRound: false,
  scores: {},
};

function TriviaGame() {
  const { id } = useParams();
  const { token } = useAppSelector((s) => s.auth);
  const [groupUsers, setGroupUsers] = useState<Group["members"]>({});
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const navigate = useNavigate();

  const ws = useRef<WebSocket>();

  const messageRecieved = useMemo(
    () => (data: any) => {
      const msg = JSON.parse(data);

      switch (msg.type) {
        case "auth":
          if (!msg.result) {
            ws.current?.close();
            ws.current = undefined;
            navigate("/");
          }
          break;
        case "start":
          setGameState((gs) => ({
            ...gs,
            started: true,
          }));
          break;
        case "gameState":
          setGameState((gs) => ({
            ...gs,
            question: msg.question,
            correctAnswer: msg.correctAnswer,
            started: msg.started,
            scores: msg.scores,
            round: msg.round,
          }));
          break;
        case "question":
          setGameState((gs) => ({
            ...gs,
            question: msg.question,
            selectedAnswer: undefined,
            correctAnswer: undefined,
            showRound: false,
          }));
          break;
        case "result":
          setGameState((gs) => ({
            ...gs,
            answered: false,
            correctAnswer: msg.correctAnswer,
            scores: msg.scores,
          }));
          break;
        case "nextRound":
          setGameState((gs) => ({
            ...gs,
            round: msg.round,
            showRound: true,
          }));
          break;
        case "final":
          setGameState((gs) => ({
            ...gs,
            answered: false,
            gameOver: true,
            scores: msg.scores,
          }));
          break;
        case "restart":
          setGameState(INITIAL_STATE);
          break;
        default:
          break;
      }
    },
    [navigate]
  );

  //Connect to websocket
  useEffect(() => {
    if (!ws.current) {
      ws.current = startWebSocket(
        "trivia",
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

  //get user data
  useEffect(() => {
    async function getUsers() {
      const group = await GroupFinderApi.getGroup(+(id as string));
      setGroupUsers(group.members);
    }
    getUsers();
  }, [id]);

  function sendAnswer(idx: number) {
    ws.current?.send(
      JSON.stringify({
        type: "answer",
        answer: gameState.question?.answers[idx],
      })
    );
    setGameState((gs) => ({
      ...gs,
      selectedAnswer: idx,
    }));
  }

  function startGame() {
    ws.current?.send(JSON.stringify({ type: "start" }));
  }

  function nextQuestion() {
    ws.current?.send(JSON.stringify({ type: "next" }));
  }

  function restartGame() {
    ws.current?.send(JSON.stringify({ type: "restart" }));
  }

  const restartButton = (
    <Button variant="contained" color="error" onClick={restartGame}>
      Restart
    </Button>
  );

  if (gameState.gameOver)
    return (
      <TriviaGameOver
        users={groupUsers}
        scores={gameState.scores}
        restartButton={restartButton}
      />
    );

  let side = null;
  if (gameState.started && !gameState.showRound) {
    side = (
      <TriviaQuestion
        selectedAnswer={gameState.selectedAnswer}
        correctAnswer={gameState.correctAnswer}
        question={gameState.question}
        sendAnswer={sendAnswer}
        nextQuestion={nextQuestion}
      />
    );
  } else if (gameState.showRound) {
    side = <TriviaRoundTransition round={gameState.round} />;
  } else {
    side = (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}>
        <Typography variant="h1" sx={{ my: 4 }}>
          Trivia
        </Typography>
        <Button size="large" variant="contained" onClick={startGame}>
          Start Game
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container height={800}>
        <Grid
          sx={{ boxShadow: 1, p: 2, mt: 2 }}
          item
          container
          direction="column"
          justifyContent="flex-start"
          xs={3}>
          <Grid item xs={11}>
            <Typography variant="h4" display="flex" justifyContent="center">
              Scores
            </Typography>
            <Box>
              <TriviaScores users={groupUsers} scores={gameState.scores} />
            </Box>
          </Grid>
          <Grid item xs={1}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}>
              {restartButton}
            </Box>
          </Grid>
        </Grid>
        <Grid
          item
          container
          xs={9}
          justifyContent="center"
          alignContent={gameState.started ? "baseline" : "center"}>
          {side}
        </Grid>
      </Grid>
    </Box>
  );
}

export default TriviaGame;
