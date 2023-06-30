import { SyntheticEvent, useState, Dispatch, SetStateAction } from "react";

interface AlertData {
  severity: "success" | "error";
  text: string;
  open: boolean;
}

const INITIAL_STATE: AlertData = {
  severity: "success",
  text: "",
  open: false,
};

function useAlerts(): [
  AlertData,
  Dispatch<SetStateAction<AlertData>>,
  typeof handleClose
] {
  const [alertData, setAlertData] = useState<AlertData>(INITIAL_STATE);

  function handleClose(event?: SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    setAlertData((ad) => ({
      ...ad,
      open: false,
    }));
  }

  return [alertData, setAlertData, handleClose];
}

export default useAlerts;
