import React from "react";
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";

function NavBar() {
  const user = useAppSelector((s) => s.auth.user);

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
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}>
            GroupFinder
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              variant="outlined"
              component={Link}
              to="/groups"
              sx={{ my: 2, color: "white", display: "block" }}>
              Groups
            </Button>
          </Box>
          {user.username === undefined ? (
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
                  display: { xs: "none", md: "flex" },
                  fontWeight: 500,
                  color: "inherit",
                  textDecoration: "none",
                }}>
                {user.username}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
