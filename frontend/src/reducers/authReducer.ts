import { AnyAction } from "@reduxjs/toolkit";
import {
  LOGOUT,
  SET_AVATAR,
  SET_ERROR,
  SET_TOKEN,
} from "../actions/actionTypes";

interface AuthState {
  token: string | null;
  user: User | null;
  error: string | null;
  loading: boolean;
}

const INITIAL_STATE: AuthState = {
  token: null,
  user: null,
  error: null,
  loading: true,
};

function authReducer(state = INITIAL_STATE, action: AnyAction): AuthState {
  switch (action.type) {
    case SET_TOKEN:
      return { ...action.payload, loading: false };
    case SET_ERROR:
      return { ...state, error: action.payload };
    case LOGOUT:
      return { ...INITIAL_STATE, loading: false };
    case SET_AVATAR:
      return {
        ...state,
        user: { ...state.user, avatarUrl: action.payload } as User,
      };
    default:
      return state;
  }
}

export default authReducer;
