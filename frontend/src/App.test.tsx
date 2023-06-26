import React from "react";
import { render, waitFor, screen, fireEvent } from "./testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "./api";
import App from "./App";

//username = TestUser
const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlRlc3RVc2VyIn0.XrNY2ZbmtAke3MgrqVFd4xRN2wQElzeyTvGMBx98UGs";

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

const localStorageMock = (function () {
  let store: {
    [key: string]: string;
  } = {};

  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: any) {
      store[key] = value.toString();
    },
    removeItem: function (key: string) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

afterEach(() => {
  jest.clearAllMocks();
});

it("renders", () => {
  render(<App />);
  expect(screen.getByText("Welcome to Groupfinder!")).toBeInTheDocument();
});

it("matches snapshot", () => {
  const { asFragment } = render(<App />);
  expect(asFragment()).toMatchSnapshot();
});

it("uses token in localStorage", async () => {
  localStorageMock.setItem("groupfinder-token", testToken);
  render(<App />);
  await waitFor(() => {
    expect(screen.getByTestId("PersonIcon")).toBeInTheDocument();
  });
  expect(mockGetUser).toHaveBeenCalledWith("TestUser");
});
