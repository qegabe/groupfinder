import React from "react";
import { render, waitFor, screen, fireEvent, within } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
import UserProfile from "./UserProfile";

const mockGetUser = jest
  .spyOn(GroupFinderApi, "getUser")
  .mockImplementation(async () => {
    return {
      username: "TestUser",
      bio: "Test Bio",
      avatarUrl: null,
      triviaScore: 1000,
    };
  });

afterEach(() => {
  jest.clearAllMocks();
});

it("renders", async () => {
  const { container } = render(<UserProfile />);
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(mockGetUser).toHaveBeenCalledTimes(1);
  expect(screen.getByText("TestUser")).toBeInTheDocument();
});

it("matches snapshot", async () => {
  const { container, asFragment } = render(<UserProfile />);
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(asFragment()).toMatchSnapshot();
});

it("shows edit button if logged in and same user", async () => {
  const { container } = render(<UserProfile />, undefined, {
    auth: {
      token: null,
      user: { username: "TestUser", avatarUrl: null },
      error: null,
    },
  });
  await waitFor(() => {
    expect(container.querySelector(".LoadingSpinner")).not.toBeInTheDocument();
  });
  expect(screen.getByText("Edit")).toBeInTheDocument();
});
