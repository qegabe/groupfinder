import { Dispatch } from "@reduxjs/toolkit";
import {
  CLOSE_ALERT,
  LOGOUT,
  SET_ALERT,
  SET_AVATAR,
  SET_ERROR,
  SET_TOKEN,
} from "./actionTypes";
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

function logout() {
  localStorage.removeItem("groupfinder-token");
  return {
    type: LOGOUT,
  };
}

function getUser(token: string): AppThunk {
  return async function (dispatch: Dispatch) {
    try {
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

function gotToken(token: string, user: User) {
  GroupFinderApi.token = token;
  localStorage.setItem("groupfinder-token", token);
  return {
    type: SET_TOKEN,
    payload: { token, user, error: null },
  };
}

function noToken() {
  return {
    type: SET_TOKEN,
    payload: { token: null, user: null, error: null },
  };
}

function setAvatar(url: string) {
  return {
    type: SET_AVATAR,
    payload: url,
  };
}

function setAlert(
  severity: "error" | "info" | "success" | "warning",
  text: string
) {
  return {
    type: SET_ALERT,
    payload: { severity, text, open: true },
  };
}

function closeAlert() {
  return {
    type: CLOSE_ALERT,
  };
}

export {
  register,
  login,
  getUser,
  logout,
  setAvatar,
  setAlert,
  closeAlert,
  noToken,
};
