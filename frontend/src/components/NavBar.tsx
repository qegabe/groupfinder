import React from "react";
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logout } from "../actions/actionCreators";

function NavBar() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  return (
    <AppBar position="static">
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: "flex",
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}>
            GroupFinder
          </Typography>
          <Box sx={{ flexGrow: 1, display: "flex" }}>
            <Button
              variant="outlined"
              component={Link}
              to="/groups"
              sx={{ my: 2, color: "white", display: "block" }}>
              Groups
            </Button>
          </Box>
          {!user ? (
            <Box sx={{ flexGrow: 0 }}>
              <Button
                component={Link}
                to="/register"
                sx={{ my: 2, color: "white" }}>
                Register
              </Button>
              <Button
                component={Link}
                to="/login"
                sx={{ my: 2, color: "white" }}>
                Login
              </Button>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <Typography
                noWrap
                sx={{
                  display: "inline-flex",
                  fontWeight: 500,
                  color: "inherit",
                  textDecoration: "none",
                }}>
                {user.username}
              </Typography>
              <Button
                sx={{ my: 2, ml: 2, color: "white" }}
                onClick={(e) => {
                  dispatch(logout());
                }}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
