import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { RootState, setupStore } from "./store";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PreloadedState } from "@reduxjs/toolkit";

interface CustomRenderOptions {
  currentRoute?: string;
  routePath?: string;
  preloadedState?: PreloadedState<RootState>;
}

function customRender(
  ui: ReactElement,
  cOptions: CustomRenderOptions = {},
  options?: Omit<RenderOptions, "wrapper">
) {
  const store = setupStore(cOptions.preloadedState);
  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter
          initialEntries={
            cOptions.currentRoute ? [cOptions.currentRoute] : undefined
          }>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {cOptions.routePath ? (
              <Routes>
                <Route path={cOptions.routePath} element={children} />
              </Routes>
            ) : (
              children
            )}
          </LocalizationProvider>
        </MemoryRouter>
      </Provider>
    );
  }
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
