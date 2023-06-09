import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import useFormData from "../../hooks/useFormData";
import { useAppDispatch } from "../../hooks/redux";
import { login } from "../../actions/actionCreators";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, handleChange] = useFormData({ username: "", password: "" });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function handleSubmit(evt: any) {
    evt.preventDefault();
    dispatch(login(formData.username, formData.password));
    navigate("/");
  }

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3">Login</Typography>
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
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </Box>
  );
}

export default Login;
