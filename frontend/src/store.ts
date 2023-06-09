import { AnyAction, ThunkAction, configureStore } from "@reduxjs/toolkit";
import groupReducer from "./reducers/groupReducers";
import userReducer from "./reducers/userReducer";
import authReducer from "./reducers/authReducer";

export const store = configureStore({
  reducer: {
    groups: groupReducer,
    users: userReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
