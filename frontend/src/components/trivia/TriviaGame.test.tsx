import React from "react";
import { render, waitFor, screen, fireEvent, within } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
import { WS } from "jest-websocket-mock";
import * as WSHelper from "../../helpers/websocket";
import dayjs from "dayjs";
import TriviaGame from "./TriviaGame";
import { theme } from "../../theme";

const mockGetGroup = jest
  .spyOn(GroupFinderApi, "getGroup")
  .mockImplementation(async (id) => {
    return {
      id: 1,
      title: "Test Group",
      description: "test",
      startTime: dayjs("2023-06-23T16:00:00.000Z"),
      endTime: dayjs("2023-06-23T17:00:00.000Z"),
      address: "123 Test Street",
      city: "Test City",
      cityId: 1,
      isPrivate: false,
      maxMembers: 10,
      members: {
        TestUser: {
          avatarUrl: null,
          isOwner: true,
        },
        TestUser3: {
          avatarUrl: null,
          isOwner: false,
        },
      },
      games: [
        { id: 1, title: "Test Game 1", coverUrl: "" },
        { id: -1, title: "Trivia", coverUrl: "" },
      ],
    };
  });

let WSServer: WS;

const mockStartWebSocket = jest
  .spyOn(WSHelper, "startWebSocket")
  .mockImplementation((path, id, token, onMessageCallback) => {
    const client = new WebSocket("ws://localhost:1234");
    client.onmessage = (e) => {
      onMessageCallback(e.data);
    };
    return client;
  });

beforeEach(() => {
  WSServer = new WS("ws://localhost:1234");
});

afterEach(() => {
  jest.clearAllMocks();
  WS.clean();
});

it("renders", async () => {
  render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await waitFor(() => {
    expect(screen.getAllByText("TestUser:")[0]).toBeInTheDocument();
  });
  expect(mockGetGroup).toHaveBeenCalledWith(1);
});

it("matches snapshot", async () => {
  const { asFragment } = render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await waitFor(() => {
    expect(screen.getAllByText("TestUser:")[0]).toBeInTheDocument();
  });
  expect(asFragment()).toMatchSnapshot();
});

it("can start game", async () => {
  render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await WSServer.connected;
  const startButton = screen.getByText("Start Game");
  fireEvent.click(startButton);
  await waitFor(() => {
    expect(WSServer).toReceiveMessage(JSON.stringify({ type: "start" }));
  });
});

it("can restart game", async () => {
  render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await WSServer.connected;
  const restartButton = screen.getAllByText("Restart")[0];
  fireEvent.click(restartButton);
  await waitFor(() => {
    expect(WSServer).toReceiveMessage(JSON.stringify({ type: "restart" }));
  });
});

it("displays round transition", async () => {
  render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await WSServer.connected;
  WSServer.send(JSON.stringify({ type: "start" }));
  WSServer.send(JSON.stringify({ type: "nextRound", round: 1 }));
  await waitFor(() => {
    expect(screen.getByText("Round 1")).toBeInTheDocument();
  });
});

it("displays questions and sends answers", async () => {
  render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await WSServer.connected;
  WSServer.send(JSON.stringify({ type: "start" }));
  WSServer.send(JSON.stringify({ type: "nextRound", round: 1 }));
  WSServer.send(
    JSON.stringify({
      type: "question",
      question: {
        question: "Test Question",
        answers: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
        category: "Test Category",
      },
    })
  );
  await waitFor(() => {
    expect(screen.getByText("Test Question")).toBeInTheDocument();
  });
  const answerButton = screen.getByText("Answer 1");
  fireEvent.click(answerButton);
  await waitFor(() => {
    expect(WSServer).toReceiveMessage(
      JSON.stringify({ type: "answer", answer: "Answer 1" })
    );
  });
});

it("displays question results and request next question", async () => {
  render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await WSServer.connected;
  WSServer.send(JSON.stringify({ type: "start" }));
  WSServer.send(JSON.stringify({ type: "nextRound", round: 1 }));
  WSServer.send(
    JSON.stringify({
      type: "question",
      question: {
        question: "Test Question",
        answers: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
        category: "Test Category",
      },
    })
  );
  await waitFor(() => {
    expect(screen.getByText("Test Question")).toBeInTheDocument();
  });
  WSServer.send(
    JSON.stringify({
      type: "result",
      correctAnswer: "Answer 1",
      scores: { TestUser: 100 },
    })
  );
  await waitFor(() => {
    expect(screen.getByText("Next Question")).toBeInTheDocument();
  });
  const correctAnswerButton = screen.getByText("Answer 1");
  expect(correctAnswerButton.className).toContain("MuiButton-containedSuccess");
  const { getByText: getScoreText } = within(
    screen.getAllByTestId("TestUser-score")[0]
  );
  expect(getScoreText("100")).toBeInTheDocument();
  fireEvent.click(screen.getByText("Next Question"));
  await waitFor(() => {
    expect(WSServer).toReceiveMessage(JSON.stringify({ type: "next" }));
  });
});

it("displays final scores", async () => {
  render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await WSServer.connected;
  WSServer.send(JSON.stringify({ type: "final", scores: { TestUser: 100 } }));
  await waitFor(() => {
    expect(screen.getByText("Final Scores")).toBeInTheDocument();
  });
  const { getByText: getScoreText } = within(
    screen.getByTestId("TestUser-score")
  );
  expect(getScoreText("100")).toBeInTheDocument();
});

it("get gamestate from server", async () => {
  render(<TriviaGame />, {
    currentRoute: "/games/trivia/1",
    routePath: "/games/trivia/:id",
  });
  await WSServer.connected;
  WSServer.send(
    JSON.stringify({
      type: "gameState",
      question: {
        question: "Test Question",
        answers: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
        category: "Test Category",
      },
      correctAnswer: undefined,
      scores: { TestUser: 100 },
      round: 1,
      started: true,
    })
  );
  await waitFor(() => {
    expect(screen.getByText("Test Question")).toBeInTheDocument();
  });
  expect(screen.queryByText("Next Question")).not.toBeInTheDocument();
  const { getByText: getScoreText } = within(
    screen.getAllByTestId("TestUser-score")[0]
  );
  expect(getScoreText("100")).toBeInTheDocument();
});
