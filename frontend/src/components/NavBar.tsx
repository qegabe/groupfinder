import React, { useState, MouseEvent } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logout } from "../actions/actionCreators";
import { theme } from "../theme";

function NavBar() {
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [authAnchorEl, setAuthAnchorEl] = useState<null | HTMLElement>(null);
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isUserMenuOpen = Boolean(userAnchorEl);
  const isAuthMenuOpen = Boolean(authAnchorEl);

  function handleUserMenuOpen(evt: MouseEvent<HTMLElement>) {
    setUserAnchorEl(evt.currentTarget);
  }

  function handleUserMenuClose() {
    setUserAnchorEl(null);
  }

  function handleAuthMenuOpen(evt: MouseEvent<HTMLElement>) {
    console.log("test");
    setAuthAnchorEl(evt.currentTarget);
  }

  function handleAuthMenuClose() {
    setAuthAnchorEl(null);
  }

  const userMenu = (
    <Menu
      anchorEl={userAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isUserMenuOpen}
      onClose={handleUserMenuClose}>
      <MenuItem
        onClick={(e) => {
          handleUserMenuClose();
          navigate("/user/groups");
        }}>
        My Groups
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          handleUserMenuClose();
          navigate(`/users/${user?.username}`);
        }}>
        Profile
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          handleUserMenuClose();
          dispatch(logout());
        }}>
        Logout
      </MenuItem>
    </Menu>
  );

  const authMenu = (
    <Menu
      anchorEl={authAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isAuthMenuOpen}
      onClose={handleAuthMenuClose}>
      <MenuItem
        onClick={(e) => {
          handleAuthMenuClose();
          navigate("/register");
        }}>
        Register
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          handleAuthMenuClose();
          navigate("/login");
        }}>
        Login
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar color="primary" enableColorOnDark position="static">
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
              component={Link}
              to="/groups"
              sx={{ my: 2, color: "inherit", display: "block" }}>
              Groups
            </Button>
          </Box>
          {user ? (
            <Box sx={{ flexGrow: 0 }}>
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                aria-controls={isUserMenuOpen ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen ? "true" : undefined}>
                <Avatar src={user.avatarUrl || undefined} />
              </IconButton>
            </Box>
          ) : (
            <>
              <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
                <Button
                  component={Link}
                  to="/register"
                  sx={{ my: 2, color: "inherit" }}>
                  Register
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  sx={{ my: 2, color: "inherit" }}>
                  Login
                </Button>
              </Box>
              <Box sx={{ flexGrow: 0, display: { xs: "flex", md: "none" } }}>
                <IconButton
                  onClick={handleAuthMenuOpen}
                  size="small"
                  aria-controls={isAuthMenuOpen ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={isAuthMenuOpen ? "true" : undefined}>
                  <MenuIcon sx={{ color: theme.palette.background.default }} />
                </IconButton>
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
      {authMenu}
      {userMenu}
    </AppBar>
  );
}

export default NavBar;
