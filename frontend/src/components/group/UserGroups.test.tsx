import React from "react";
import { render, waitFor, screen } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
import dayjs from "dayjs";
import UserGroups from "./UserGroups";

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

afterEach(() => {
  jest.clearAllMocks();
});

it("renders", async () => {
  const { container } = render(<UserGroups />, {
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
  expect(mockGetGroups).toHaveBeenCalledWith({ hasUsers: ["TestUser"] });
  expect(screen.getByText("Test Group 1")).toBeInTheDocument();
});

it("matches snapshot", async () => {
  const { container, asFragment } = render(<UserGroups />, {
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
