import React from "react";
import { render, waitFor, screen, fireEvent } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
import Login from "./Login";

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlRlc3RVc2VyIn0.XrNY2ZbmtAke3MgrqVFd4xRN2wQElzeyTvGMBx98UGs";

const mockLogin = jest
  .spyOn(GroupFinderApi, "login")
  .mockImplementation(async () => {
    return testToken;
  });

const mockGetUser = jest
  .spyOn(GroupFinderApi, "getUser")
  .mockImplementation(async () => {});

afterEach(() => {
  jest.clearAllMocks();
});

it("renders", async () => {
  render(<Login />);
  expect(screen.getByText("Login")).toBeInTheDocument();
});

it("matches snapshot", async () => {
  const { asFragment } = render(<Login />);
  expect(asFragment()).toMatchSnapshot();
});

it("lets user login", async () => {
  render(<Login />);
  const usernameInput = screen.getByLabelText("Username");
  const passwordInput = screen.getByLabelText("Password");
  const submitButton = screen.getByText("Submit");
  fireEvent.change(usernameInput, { target: { value: "TestUser" } });
  fireEvent.change(passwordInput, { target: { value: "12345" } });
  fireEvent.click(submitButton);
  await waitFor(() => {
    expect(mockLogin).toBeCalledWith("TestUser", "12345");
  });
  expect(mockGetUser).toBeCalledWith("TestUser");
});
