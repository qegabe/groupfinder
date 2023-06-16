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
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logout } from "../actions/actionCreators";

function NavBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  const isMenuOpen = Boolean(anchorEl);

  function handleMenuOpen(evt: MouseEvent<HTMLElement>) {
    setAnchorEl(evt.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}>
      <MenuItem component={Link} to="/user/groups">
        My Groups
      </MenuItem>
      <MenuItem component={Link} to="/user/edit">
        Edit Account
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          handleMenuClose();
          dispatch(logout());
        }}>
        Logout
      </MenuItem>
    </Menu>
  );

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
          {user ? (
            <Box sx={{ flexGrow: 0 }}>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                aria-controls={isMenuOpen ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={isMenuOpen ? "true" : undefined}>
                <Avatar src={user.avatarUrl || undefined} />
              </IconButton>
            </Box>
          ) : (
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
          )}
        </Toolbar>
      </Container>
      {renderMenu}
    </AppBar>
  );
}

export default NavBar;
