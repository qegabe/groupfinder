import { AnyAction } from "@reduxjs/toolkit";
import { SET_TOKEN } from "../actions/actionTypes";

const INITIAL_STATE: { token: string | null; user: IUser } = {
  token: null,
  user: {},
};

function authReducer(state = INITIAL_STATE, action: AnyAction) {
  switch (action.type) {
    case SET_TOKEN:
      return { ...action.payload };
    default:
      return state;
  }
}

export default authReducer;
