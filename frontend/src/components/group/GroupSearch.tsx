import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function GroupSearch() {
  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off">
      <TextField />
    </Box>
  );
}

export default GroupSearch;
