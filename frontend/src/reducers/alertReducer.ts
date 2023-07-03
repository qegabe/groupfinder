import { AnyAction } from "@reduxjs/toolkit";
import { CLOSE_ALERT, SET_ALERT } from "../actions/actionTypes";

interface Alert {
  severity: "error" | "info" | "success" | "warning";
  text: string;
  open: boolean;
}

function alertReducer(
  state: Alert = { severity: "success", text: "", open: false },
  action: AnyAction
): Alert {
  switch (action.type) {
    case SET_ALERT:
      return { ...action.payload };
    case CLOSE_ALERT:
      return { ...state, open: false };
    default:
      return state;
  }
}

export default alertReducer;
