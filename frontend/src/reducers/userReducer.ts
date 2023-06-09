import { Action } from "@reduxjs/toolkit";

function userReducer(state = {}, action: Action) {
  switch (action.type) {
    case "":
      return state;

    default:
      return state;
  }
}

export default userReducer;
