import React from "react";
import { render, waitFor, screen, fireEvent, within } from "../../testutils";
import "@testing-library/jest-dom";
import GroupFinderApi from "../../api";
import dayjs from "dayjs";
import NewGroup from "./NewGroup";

const mockCreateGroup = jest
  .spyOn(GroupFinderApi, "createGroup")
  .mockImplementation(async () => {});

it("renders", async () => {
  render(<NewGroup />);
  expect(screen.getByText("Create New Group")).toBeInTheDocument();
});

it("matches snapshot", async () => {
  const { asFragment } = render(<NewGroup />);
  expect(asFragment()).toMatchSnapshot();
});

it("allows user to create group", async () => {
  render(<NewGroup />);
  const titleInput = screen.getByLabelText("Title *");
  const startTimeInput = screen.getByLabelText("Start Time");
  const endTimeInput = screen.getByLabelText("End Time");
  const createButton = screen.getByText("Create");
  fireEvent.change(titleInput, { target: { value: "Test" } });
  fireEvent.change(startTimeInput, {
    target: { value: "06/23/2023 12:00 PM" },
  });
  fireEvent.change(endTimeInput, {
    target: { value: "06/23/2023 01:00 PM" },
  });
  fireEvent.click(createButton);

  waitFor(() => {
    expect(screen.getByText("Create New Group")).not.toBeInTheDocument();
  });
  expect(mockCreateGroup).toBeCalledWith({
    title: "Test",
    description: "",
    startTime: dayjs("2023-06-23T16:00:00.000Z"),
    endTime: dayjs("2023-06-23T17:00:00.000Z"),
    address: "",
    cityData: null,
    isPrivate: false,
    maxMembers: 10,
  });
});
