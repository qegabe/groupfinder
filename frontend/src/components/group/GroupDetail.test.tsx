import React from "react";
import { render, waitFor, screen, fireEvent, within } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
import { WS } from "jest-websocket-mock";
import * as WSHelper from "../../helpers/websocket";
import dayjs from "dayjs";
import GroupDetail from "./GroupDetail";

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

const mockJoinGroup = jest
  .spyOn(GroupFinderApi, "joinGroup")
  .mockImplementation(async () => {});

const mockLeaveGroup = jest
  .spyOn(GroupFinderApi, "leaveGroup")
  .mockImplementation(async () => {});

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
  const { container } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(mockGetGroup).toHaveBeenCalledWith(1);
  expect(screen.getByText("Test Group")).toBeInTheDocument();
});

it("matches snapshot", async () => {
  const { container, asFragment } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(asFragment()).toMatchSnapshot();
});

it("shows play trivia if trivia game in group and user is member", async () => {
  const { container } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(screen.getByText("Play Trivia"));
});

it("lets user join group if not member", async () => {
  const { container } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser2", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const joinButton = screen.getByText("Join Group");
  fireEvent.click(joinButton);
  await waitFor(() => {
    expect(joinButton).not.toBeInTheDocument();
  });
  expect(mockJoinGroup).toHaveBeenCalledWith(1);
});

it("lets user leave group if member", async () => {
  const { container } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser3", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const leaveButton = screen.getByText("Leave Group");
  fireEvent.click(leaveButton);
  await waitFor(() => {
    expect(leaveButton).not.toBeInTheDocument();
  });
  expect(mockLeaveGroup).toHaveBeenCalledWith(1);
});

it("shows edit button if owner", async () => {
  const { container } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(screen.getByLabelText("Edit"));
});

it("connects to chatroom websocket server", async () => {
  const { container } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  await WSServer.connected;
  expect(mockStartWebSocket).toHaveBeenCalledWith(
    "chat",
    1,
    "",
    expect.any(Function)
  );
});

it("displays messages received from the chatroom", async () => {
  const { container } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  await WSServer.connected;
  const chatButton = screen.getByLabelText("chat");
  fireEvent.click(chatButton);
  WSServer.send(
    JSON.stringify({ type: "system", text: "Test System Message" })
  );
  WSServer.send(
    JSON.stringify({
      type: "chat",
      username: "TestUser",
      text: "Test Chat Message",
      avatarUrl: null,
    })
  );
  await waitFor(() => {
    expect(screen.getByText("Test Chat Message")).toBeInTheDocument();
  });
  expect(screen.getByText("Test System Message")).toBeInTheDocument();
});

it("lets user send messages to the chatroom", async () => {
  const { container } = render(<GroupDetail />, {
    currentRoute: "/groups/1",
    routePath: "/groups/:id",
    preloadedState: {
      auth: {
        token: null,
        user: { username: "TestUser", avatarUrl: null },
        error: null,
        loading: false,
      },
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  await WSServer.connected;
  const chatButton = screen.getByLabelText("chat");
  fireEvent.click(chatButton);
  const chatInput = screen.getByTestId("chat-input");
  fireEvent.change(chatInput, { target: { value: "Test Sent Message" } });
  fireEvent.submit(chatInput.parentElement as HTMLElement);
  await waitFor(() => {
    expect(WSServer).toReceiveMessage(
      JSON.stringify({
        text: "Test Sent Message",
        username: "TestUser",
        type: "chat",
        avatarUrl: null,
      })
    );
  });
});
