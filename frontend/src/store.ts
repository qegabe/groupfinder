import {
  AnyAction,
  PreloadedState,
  ThunkAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import alertReducer from "./reducers/alertReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  alert: alertReducer,
});

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
