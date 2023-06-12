import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import useFormData from "../../hooks/useFormData";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { register } from "../../actions/actionCreators";
import parseFormErrors from "../../helpers/parseFormErrors";

function Register() {
  const [formData, handleChange] = useFormData({ username: "", password: "" });
  const authError = useAppSelector((s) => s.auth.error);
  const dispatch = useAppDispatch();

  function handleSubmit(evt: any) {
    evt.preventDefault();
    dispatch(register(formData.username, formData.password));
  }

  let formErrors: any = {};
  if (authError) {
    formErrors = parseFormErrors(authError);
    console.log(formErrors);
  }

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3">Register</Typography>
      <Box
        component="form"
        autoComplete="off"
        sx={{ display: "block", my: 3, width: "60%" }}
        onSubmit={handleSubmit}>
        <TextField
          fullWidth
          id="username"
          label="Username"
          variant="outlined"
          sx={{ my: 1 }}
          value={formData.username}
          onChange={handleChange}
          {...formErrors.username}
        />
        <TextField
          fullWidth
          id="password"
          label="Password"
          type="password"
          variant="outlined"
          sx={{ my: 1 }}
          value={formData.password}
          onChange={handleChange}
          {...formErrors.password}
        />
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </Box>
  );
}

export default Register;
