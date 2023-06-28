import React from "react";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import useFormData from "../../hooks/useFormData";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { login } from "../../actions/actionCreators";
import parseFormErrors from "../../helpers/parseFormErrors";

function Login() {
  const [formData, handleChange] = useFormData({ username: "", password: "" });
  const authError = useAppSelector((s) => s.auth.error);
  const dispatch = useAppDispatch();

  function handleSubmit(evt: any) {
    evt.preventDefault();
    dispatch(login(formData.username, formData.password));
  }

  let formErrors: any = {};
  if (authError) {
    formErrors = parseFormErrors(authError);
  }

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3" sx={{ mt: 2 }}>
        Login
      </Typography>
      {formErrors.message ? (
        <Alert severity="error">{formErrors.message}</Alert>
      ) : null}
      <Box
        component="form"
        autoComplete="off"
        sx={{
          display: "grid",
          my: 3,
          px: 1,
          width: { xs: "100%", lg: "60%" },
          justifyItems: "center",
        }}
        onSubmit={handleSubmit}>
        <TextField
          fullWidth
          id="username"
          label="Username"
          variant="outlined"
          sx={{ my: 1 }}
          value={formData.username}
          onChange={handleChange}
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
        />
        <Button sx={{ my: 2 }} variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </Box>
  );
}

export default Login;
