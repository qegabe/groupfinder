import React from "react";
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
    <div className="App">
      <NavBar />
      <GroupfinderRoutes />
    </div>
  );
}

export default App;
