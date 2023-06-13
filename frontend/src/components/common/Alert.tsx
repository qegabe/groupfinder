import React from "react";
import { Typography } from "@mui/material";

const colors = {
  success: {
    text: "rgb(0,200,0)",
    border: "rgb(0,255,0,0.5)",
    background: "rgb(0,255,0,0.25)",
  },
  danger: {
    text: "rgb(200,0,0)",
    border: "rgb(255,0,0,0.5)",
    background: "rgb(255,0,0,0.25)",
  },
};

function Alert({ type, text }: AlertProps) {
  return (
    <Typography
      sx={{
        color: colors[type].text,
        p: 2,
        my: 2,
        border: 1,
        borderRadius: "5px",
        borderColor: colors[type].border,
        backgroundColor: colors[type].background,
      }}>
      {text}
    </Typography>
  );
}

export default Alert;
