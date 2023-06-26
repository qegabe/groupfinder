import React from "react";
import { render, waitFor, screen, fireEvent, within } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
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

afterEach(() => {
  jest.clearAllMocks();
});

it("renders", async () => {
  const { container } = render(<GroupDetail />, "/groups/1");
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(mockGetGroup).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Test Group"));
});

it("matches snapshot", async () => {
  const { container, asFragment } = render(<GroupDetail />, "/groups/1");
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(asFragment()).toMatchSnapshot();
});

it("shows play trivia if trivia game in group", async () => {
  const { container } = render(<GroupDetail />, "/groups/1");
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(screen.getByText("Play Trivia"));
});

it("lets user join group if not member", async () => {
  const { container } = render(<GroupDetail />, "/groups/1", {
    auth: {
      token: null,
      user: { username: "TestUser2", avatarUrl: null },
      error: null,
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const joinButton = screen.getByText("Join");
  fireEvent.click(joinButton);
  await waitFor(() => {
    expect(mockJoinGroup).toHaveBeenCalledTimes(1);
    expect(joinButton).not.toBeInTheDocument();
  });
});

it("lets user leave group if member", async () => {
  const { container } = render(<GroupDetail />, "/groups/1", {
    auth: {
      token: null,
      user: { username: "TestUser3", avatarUrl: null },
      error: null,
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const leaveButton = screen.getByText("Leave");
  fireEvent.click(leaveButton);
  await waitFor(() => {
    expect(mockLeaveGroup).toHaveBeenCalledTimes(1);
    expect(leaveButton).not.toBeInTheDocument();
  });
});

it("shows edit button if owner", async () => {
  const { container } = render(<GroupDetail />, "/groups/1", {
    auth: {
      token: null,
      user: { username: "TestUser", avatarUrl: null },
      error: null,
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(screen.getByText("Edit"));
});
