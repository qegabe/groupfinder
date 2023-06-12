import { Dispatch } from "@reduxjs/toolkit";
import { SET_ERROR, SET_TOKEN } from "./actionTypes";
import GroupFinderApi from "../api";
import decode from "jwt-decode";
import { AppThunk } from "../store";

function register(username: string, password: string): AppThunk {
  return async function (dispatch: Dispatch) {
    try {
      const token = await GroupFinderApi.register(username, password);
      const tokenData = decode(token) as any;
      const user = await GroupFinderApi.getUser(tokenData.username);
      dispatch(gotToken(token, user));
    } catch (error) {
      if (typeof error === "string") {
        dispatch(gotError(error));
      } else console.error(error);
    }
  };
}

function login(username: string, password: string): AppThunk {
  return async function (dispatch: Dispatch) {
    try {
      const token = await GroupFinderApi.login(username, password);
      const tokenData = decode(token) as any;
      const user = await GroupFinderApi.getUser(tokenData.username);
      dispatch(gotToken(token, user));
    } catch (error) {
      if (typeof error === "string") {
        dispatch(gotError(error));
      } else console.error(error);
    }
  };
}

function gotError(error: string) {
  return {
    type: SET_ERROR,
    payload: error,
  };
}

function gotToken(token: string, user: IUser) {
  GroupFinderApi.token = token;
  return {
    type: SET_TOKEN,
    payload: { token, user, error: null },
  };
}

export { register, login };
