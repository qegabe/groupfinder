import React, { useEffect, SyntheticEvent } from "react";
import { Alert, Snackbar } from "@mui/material";
import GroupfinderRoutes from "./components/GroupfinderRoutes";
import NavBar from "./components/NavBar";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { closeAlert, getUser, noToken } from "./actions/actionCreators";
import { shallowEqual } from "react-redux";

function App() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.auth.loading);
  const alertData = useAppSelector((s) => s.alert, shallowEqual);

  useEffect(() => {
    const localStorageToken = localStorage.getItem("groupfinder-token");
    if (localStorageToken && loading) {
      dispatch(getUser(localStorageToken));
    } else if (loading) {
      dispatch(noToken());
    }
  }, [dispatch, loading]);

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
