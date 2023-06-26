import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { RootState, setupStore } from "./store";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PreloadedState } from "@reduxjs/toolkit";

function customRender(
  ui: ReactElement,
  route?: string,
  preloadedState?: PreloadedState<RootState>,
  options?: Omit<RenderOptions, "wrapper">
) {
  const store = setupStore(preloadedState);
  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={route ? [route] : undefined}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {children}
          </LocalizationProvider>
        </MemoryRouter>
      </Provider>
    );
  }
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
