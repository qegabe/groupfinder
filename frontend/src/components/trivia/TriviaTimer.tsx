import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

interface TriviaTimerProps {
  initialTime: number;
}

function TriviaTimer({ initialTime }: TriviaTimerProps) {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const tId = setInterval(() => {
      setTime((t) => (t -= 1));
    }, 1000);
    return () => {
      clearInterval(tId);
    };
  }, []);

  const progress = Math.max((time / initialTime) * 100, 0);

  return <CircularProgress variant="determinate" value={progress} />;
}

export default TriviaTimer;
