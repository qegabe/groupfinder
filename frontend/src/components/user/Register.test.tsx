import React from "react";
import { render, waitFor, screen, fireEvent } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
import Register from "./Register";

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlRlc3RVc2VyIn0.XrNY2ZbmtAke3MgrqVFd4xRN2wQElzeyTvGMBx98UGs";

const mockRegister = jest
  .spyOn(GroupFinderApi, "register")
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
  render(<Register />);
  expect(screen.getByText("Register")).toBeInTheDocument();
});

it("matches snapshot", async () => {
  const { asFragment } = render(<Register />);
  expect(asFragment()).toMatchSnapshot();
});

it("lets user register", async () => {
  render(<Register />);
  const usernameInput = screen.getByLabelText("Username");
  const passwordInput = screen.getByLabelText("Password");
  const submitButton = screen.getByText("Submit");
  fireEvent.change(usernameInput, { target: { value: "TestUser" } });
  fireEvent.change(passwordInput, { target: { value: "12345" } });
  fireEvent.click(submitButton);
  await waitFor(() => {
    expect(mockRegister).toBeCalledTimes(1);
    expect(mockRegister).toBeCalledWith("TestUser", "12345");
    expect(mockGetUser).toBeCalledTimes(1);
    expect(mockGetUser).toBeCalledWith("TestUser");
  });
});
