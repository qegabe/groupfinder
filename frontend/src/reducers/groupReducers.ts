import { AnyAction } from "@reduxjs/toolkit";
import { ADD_GROUP, LOAD_GROUPS } from "../actions/actionTypes";

const INITIAL_STATE: IGroup[] = [];

function groupReducer(state = INITIAL_STATE, action: AnyAction) {
  switch (action.type) {
    case LOAD_GROUPS:
      return [...action.payload];
    case ADD_GROUP:
      return [...state, action.payload];
    default:
      return state;
  }
}

export default groupReducer;
