import React from "react";
import { render, waitFor, screen, fireEvent, within } from "../../testutils";
import "@testing-library/jest-dom";
import EditGroup from "./EditGroup";
import GroupFinderApi from "../../api";
import dayjs from "dayjs";

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
      games: [{ id: 1, title: "Test Game 1", coverUrl: "" }],
    };
  });

const mockSearchGame = jest
  .spyOn(GroupFinderApi, "searchGame")
  .mockImplementation(async () => {
    return [{ id: 2, title: "Test Game 2", coverUrl: "" }];
  });

const mockGetUsers = jest
  .spyOn(GroupFinderApi, "getUsers")
  .mockImplementation(async () => {
    return [{ username: "TestUser2", avatarUrl: null }];
  });

const mockEditGroup = jest
  .spyOn(GroupFinderApi, "editGroup")
  .mockImplementation(async () => {});

const mockDeleteGroup = jest
  .spyOn(GroupFinderApi, "deleteGroup")
  .mockImplementation(async () => {});

const mockAddGame = jest
  .spyOn(GroupFinderApi, "addGame")
  .mockImplementation(async () => {});

const mockRemoveGame = jest
  .spyOn(GroupFinderApi, "removeGame")
  .mockImplementation(async () => {});

const mockAddUser = jest
  .spyOn(GroupFinderApi, "addUser")
  .mockImplementation(async () => {});

const mockRemoveUser = jest
  .spyOn(GroupFinderApi, "removeUser")
  .mockImplementation(async () => {});

afterEach(() => {
  jest.clearAllMocks();
});

it("renders", async () => {
  const { container } = render(<EditGroup />, {
    currentRoute: "/groups/1/edit",
    routePath: "/groups/:id/edit",
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(mockGetGroup).toHaveBeenCalledTimes(1);
  const titleInput = container.querySelector("#title");
  expect(titleInput).toHaveValue("Test Group");
});

it("matches snapshot", async () => {
  const { container, asFragment } = render(<EditGroup />, {
    currentRoute: "/groups/1/edit",
    routePath: "/groups/:id/edit",
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(asFragment()).toMatchSnapshot();
});

it("lets owner edit basic info", async () => {
  const { container } = render(<EditGroup />, {
    currentRoute: "/groups/1/edit",
    routePath: "/groups/:id/edit",
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const titleInput = container.querySelector("#title");
  const saveButton = screen.getByText("Save");
  fireEvent.change(titleInput as Element, { target: { value: "New Title" } });
  fireEvent.click(saveButton);
  await waitFor(() => {
    expect(mockEditGroup).toBeCalledWith(1, {
      title: "New Title",
      description: "test",
      startTime: dayjs("2023-06-23T16:00:00.000Z"),
      endTime: dayjs("2023-06-23T17:00:00.000Z"),
      address: "123 Test Street",
      cityData: { city: "Test City", id: 1 },
      isPrivate: false,
      maxMembers: 10,
    });
  });
  expect(titleInput).toHaveValue("New Title");
});

it("lets owner delete group", async () => {
  const { container } = render(<EditGroup />, {
    currentRoute: "/groups/1/edit",
    routePath: "/groups/:id/edit",
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const deleteIcon = screen.getByLabelText("delete group");
  fireEvent.click(deleteIcon);
  await waitFor(() => {
    expect(
      screen.getByText("Are you sure you want to delete this group?")
    ).toBeInTheDocument();
  });
  const deleteButton = screen.getByText("Delete");
  fireEvent.click(deleteButton);
  await waitFor(() => {
    expect(mockDeleteGroup).toBeCalledWith(1);
  });
});

it("lets owner add game", async () => {
  const { container } = render(<EditGroup />, {
    currentRoute: "/groups/1/edit",
    routePath: "/groups/:id/edit",
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const autocomplete = screen.getByTestId("autocomplete-addgame");
  const addGameForm = screen.getByTestId("div-addgame");
  const input = within(addGameForm).getByLabelText("Add a game");
  const add = within(addGameForm).getByText("Add");

  autocomplete.focus();
  fireEvent.change(input, { target: { value: "a" } });
  await waitFor(() => {
    expect(screen.getByText("Test Game 2")).toBeInTheDocument();
  });
  expect(mockSearchGame).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("Test Game 2"));
  fireEvent.click(add);
  await waitFor(() => {
    expect(mockAddGame).toHaveBeenCalledWith(1, 2);
  });
});

it("lets owner remove game", async () => {
  const { container } = render(<EditGroup />, {
    currentRoute: "/groups/1/edit",
    routePath: "/groups/:id/edit",
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const gameCard = screen.getByTestId("gamecard-1");
  const deleteButton = within(gameCard).getByLabelText("delete");
  fireEvent.click(deleteButton);
  await waitFor(() => {
    expect(mockRemoveGame).toHaveBeenCalledWith(1, 1);
  });
});

it("lets owner add user", async () => {
  const { container } = render(<EditGroup />, {
    currentRoute: "/groups/1/edit",
    routePath: "/groups/:id/edit",
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const autocomplete = screen.getByTestId("autocomplete-adduser");
  const addUserForm = screen.getByTestId("div-adduser");
  const input = within(addUserForm).getByLabelText("Add a user");
  const add = within(addUserForm).getByText("Add");

  autocomplete.focus();
  fireEvent.change(input, { target: { value: "a" } });
  await waitFor(() => {
    expect(screen.getByText("TestUser2")).toBeInTheDocument();
  });
  expect(mockGetUsers).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("TestUser2"));
  fireEvent.click(add);
  await waitFor(() => {
    expect(mockAddUser).toHaveBeenCalledWith(1, "TestUser2");
  });
});

it("lets owner remove user", async () => {
  const { container } = render(<EditGroup />, {
    currentRoute: "/groups/1/edit",
    routePath: "/groups/:id/edit",
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const userCard = screen.getByTestId("usercard-TestUser3");
  const deleteButton = within(userCard).getByLabelText("delete");
  fireEvent.click(deleteButton);
  await waitFor(() => {
    expect(mockRemoveUser).toHaveBeenCalledWith(1, "TestUser3");
  });
});
