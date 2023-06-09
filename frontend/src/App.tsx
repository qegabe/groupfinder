import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import GroupfinderRoutes from "./components/GroupfinderRoutes";
import NavBar from "./components/NavBar";

function App() {
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