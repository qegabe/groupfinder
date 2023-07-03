import React, { useMemo, useState, useEffect } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import GroupFinderApi from "../../api";

interface AddUserState {
  inputValue: string;
  user: User | null;
  users: User[];
  loading: boolean;
}

function AddUser({ addUser }: AddUserProps) {
  const [state, setState] = useState<AddUserState>({
    inputValue: "",
    user: null,
    users: [],
    loading: false,
  });

  const search = useMemo(
    () =>
      debounce(async (username: string) => {
        const options = await GroupFinderApi.getUsers(username);
        setState((s) => ({
          ...s,
          users: options,
          loading: false,
        }));
      }, 400),
    []
  );

  useEffect(() => {
    if (state.inputValue === "") {
      setState((s) => ({
        ...s,
        users: [],
      }));
    } else if (!state.user) {
      setState((s) => ({
        ...s,
        loading: true,
      }));
      search(state.inputValue);
    }
  }, [state.inputValue, search, state.user]);

  return (
    <Box
      data-testid="div-adduser"
      sx={{ display: "flex", justifyContent: "center" }}>
      <Autocomplete
        loading={state.loading}
        loadingText={<CircularProgress />}
        data-testid="autocomplete-adduser"
        sx={{ width: "100%" }}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.username
        }
        filterOptions={(x) => x}
        options={state.users}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={state.user}
        noOptionsText="Start typing to search for users..."
        onChange={(e: any, newValue: User | null) => {
          setState((s) => ({
            ...s,
            users: newValue ? [newValue, ...s.users] : s.users,
            user: newValue,
          }));
        }}
        onInputChange={(e: any, newInputValue) => {
          setState((s) => ({
            ...s,
            inputValue: newInputValue,
          }));
        }}
        renderInput={(params) => (
          <TextField {...params} label="Add a user" fullWidth />
        )}
        renderOption={(props, u) => {
          return (
            <li {...props}>
              <Grid container alignItems="center">
                <Grid item sx={{ display: "flex", width: 44 }}>
                  <Avatar
                    sx={{ width: 30, height: 30, mr: 1 }}
                    src={u.avatarUrl || undefined}
                  />
                </Grid>
                <Grid item sx={{ width: "calc(100% - 44px)" }}>
                  <Typography>{u.username}</Typography>
                </Grid>
              </Grid>
            </li>
          );
        }}
      />
      <Button
        variant="contained"
        onClick={() => {
          if (state.user) addUser(state.user);
        }}>
        Add
      </Button>
    </Box>
  );
}

export default AddUser;
