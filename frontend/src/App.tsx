import React, { useEffect, SyntheticEvent } from "react";
import { Alert, Snackbar } from "@mui/material";
import GroupfinderRoutes from "./components/GroupfinderRoutes";
import NavBar from "./components/NavBar";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { closeAlert, getUser } from "./actions/actionCreators";
import { shallowEqual } from "react-redux";

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token, shallowEqual);
  const alertData = useAppSelector((s) => s.alert, shallowEqual);

  useEffect(() => {
    const localStorageToken = localStorage.getItem("groupfinder-token");
    if (localStorageToken && token === null) {
      dispatch(getUser(localStorageToken));
    }
  }, [dispatch, token]);

  function handleAlertClose(event?: SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    dispatch(closeAlert());
  }

  return (
    <div className="App">
      <NavBar />
      <GroupfinderRoutes />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={alertData.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}>
        <Alert
          severity={alertData.severity}
          sx={{ width: "100%" }}
          onClose={handleAlertClose}>
          {alertData.text}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
