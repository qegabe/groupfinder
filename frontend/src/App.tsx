import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import GroupfinderRoutes from "./components/GroupfinderRoutes";
import NavBar from "./components/NavBar";
import { useAppDispatch } from "./hooks/redux";
import { getUser } from "./actions/actionCreators";

function App() {
  const dispatch = useAppDispatch();

  const token = localStorage.getItem("groupfinder-token");
  if (token) {
    dispatch(getUser(token));
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="App">
        <NavBar />
        <GroupfinderRoutes />
      </div>
    </LocalizationProvider>
  );
}

export default App;
