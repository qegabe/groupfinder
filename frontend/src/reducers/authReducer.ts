import { AnyAction } from "@reduxjs/toolkit";
import { SET_ERROR, SET_TOKEN } from "../actions/actionTypes";

const INITIAL_STATE: {
  token: string | null;
  user: IUser;
  error: string | null;
} = {
  token: null,
  user: {},
  error: null,
};

function authReducer(state = INITIAL_STATE, action: AnyAction) {
  switch (action.type) {
    case SET_TOKEN:
      return { ...action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export default authReducer;
