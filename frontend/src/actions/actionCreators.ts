import { Dispatch } from "@reduxjs/toolkit";
import { ADD_GROUP, LOAD_GROUPS, SET_TOKEN } from "./actionTypes";
import GroupFinderApi from "../api";
import decode from "jwt-decode";
import { AppThunk } from "../store";

function register(username: string, password: string): AppThunk {
  return async function (dispatch: Dispatch) {
    const token = await GroupFinderApi.register(username, password);
    const tokenData = decode(token) as any;
    const user = await GroupFinderApi.getUser(tokenData.username);
    dispatch(gotToken(token, user));
  };
}

function login(username: string, password: string): AppThunk {
  return async function (dispatch: Dispatch) {
    const token = await GroupFinderApi.login(username, password);
    const tokenData = decode(token) as any;
    const user = await GroupFinderApi.getUser(tokenData.username);
    dispatch(gotToken(token, user));
  };
}

function gotToken(token: string, user: IUser) {
  GroupFinderApi.token = token;
  return {
    type: SET_TOKEN,
    payload: { token, user },
  };
}

function loadGroups(): AppThunk {
  return async function (dispatch: Dispatch) {
    const groups = await GroupFinderApi.getGroups();
    dispatch(gotGroups(groups));
  };
}

function gotGroups(data: any) {
  return {
    type: LOAD_GROUPS,
    payload: data,
  };
}

function addGroup(data: IGroup) {
  return async function (dispatch: Dispatch) {
    const group = await GroupFinderApi.createGroup(data);
    dispatch(addedGroup(group));
  };
}

function addedGroup(group: IGroup) {
  return {
    type: ADD_GROUP,
    payload: {
      id: group.id,
      title: group.title,
      startTime: group.startTime,
      endTime: group.endTime,
    },
  };
}

export { loadGroups, register, login, addGroup };
