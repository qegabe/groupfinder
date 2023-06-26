import React from "react";
import { render, waitFor, screen, fireEvent } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
import EditUser from "./EditUser";

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

const mockUpdateProfile = jest
  .spyOn(GroupFinderApi, "updateProfile")
  .mockImplementation(async () => {});

afterEach(() => {
  jest.clearAllMocks();
});

it("renders", async () => {
  const { container } = render(<EditUser />);
  await waitFor(() => {
    const bioInput = container.querySelector("#bio");
    expect(bioInput).toHaveValue("Test Bio");
  });
  expect(mockGetUser).toHaveBeenCalledTimes(1);
});

it("matches snapshot", async () => {
  const { container, asFragment } = render(<EditUser />);
  await waitFor(() => {
    const bioInput = container.querySelector("#bio");
    expect(bioInput).toHaveValue("Test Bio");
  });
  expect(asFragment()).toMatchSnapshot();
});

it("lets user update profile", async () => {
  const { container } = render(<EditUser />, undefined, {
    auth: {
      token: null,
      user: { username: "TestUser", avatarUrl: null },
      error: null,
    },
  });
  await waitFor(() => {
    const bioInput = container.querySelector("#bio");
    expect(bioInput).toHaveValue("Test Bio");
  });
  const avatarUrlInput = container.querySelector("#avatarUrl");
  const saveButton = screen.getByText("Save");
  fireEvent.change(avatarUrlInput as Element, {
    target: { value: "http://some.img" },
  });
  fireEvent.click(saveButton);
  await waitFor(() => {
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });
  expect(mockUpdateProfile).toHaveBeenCalledWith("TestUser", {
    bio: "Test Bio",
    avatarUrl: "http://some.img",
  });
});
