import React from "react";
import { render, waitFor, screen, fireEvent, within } from "../../testutils";
import "@testing-library/jest-dom";
import Groups from "./Groups";
import GroupFinderApi from "../../api";
import dayjs from "dayjs";

const mockGetGroups = jest
  .spyOn(GroupFinderApi, "getGroups")
  .mockImplementation(async () => {
    return [
      {
        id: 1,
        title: "Test Group 1",
        startTime: dayjs("2023-06-23T16:00:00.000Z"),
        endTime: dayjs("2023-06-23T17:00:00.000Z"),
      },
      {
        id: 2,
        title: "Test Group 2",
        startTime: dayjs("2023-06-23T17:00:00.000Z"),
        endTime: dayjs("2023-06-23T18:00:00.000Z"),
      },
      {
        id: 3,
        title: "Test Group 3",
        startTime: dayjs("2023-06-23T18:00:00.000Z"),
        endTime: dayjs("2023-06-23T19:00:00.000Z"),
      },
    ];
  });

const mockSearchGame = jest
  .spyOn(GroupFinderApi, "searchGame")
  .mockImplementation(async () => {
    return [{ id: 1, title: "Test Game", coverUrl: "" }];
  });

afterEach(() => {
  jest.clearAllMocks();
});

it("renders", async () => {
  const { container } = render(<Groups />);
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(mockGetGroups).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Test Group 1")).toBeInTheDocument();
});

it("matches snapshot", async () => {
  const { container, asFragment } = render(<Groups />);
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(asFragment()).toMatchSnapshot();
});

it("lets users filter groups", async () => {
  const { container } = render(<Groups />);
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  const searchField = container.querySelector("#term");
  const maxMembers = screen.getByLabelText("Max Members");
  const searchButton = screen.getByText("Search");
  fireEvent.change(searchField as Element, { target: { value: "a" } });
  fireEvent.change(maxMembers, { target: { value: 15 } });
  fireEvent.click(searchButton);
  await waitFor(() => {
    expect(mockGetGroups).toBeCalledWith({ title: "a", maxSize: 15 });
  });
});

it("lets users add game to filter", async () => {
  const { container } = render(<Groups />);
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });

  const autocomplete = screen.getByTestId("autocomplete-addgame");
  const addGameForm = screen.getByTestId("form-addgame");
  const input = within(addGameForm).getByLabelText("Add a game");
  const add = within(addGameForm).getByText("Add");

  autocomplete.focus();
  fireEvent.change(input, { target: { value: "a" } });
  await waitFor(() => {
    const game = screen.getByText("Test Game");
    expect(mockSearchGame).toHaveBeenCalledTimes(1);
    expect(game).toBeInTheDocument();
    fireEvent.click(game);
  });
  fireEvent.click(add);
  await waitFor(() => {
    expect(screen.getByTestId("gamecard-1")).toBeInTheDocument();
  });

  const searchButton = screen.getByText("Search");
  fireEvent.click(searchButton);
  await waitFor(() => {
    expect(mockGetGroups).toBeCalledWith({
      title: "",
      maxSize: 10,
      hasGames: [1],
    });
  });
});
