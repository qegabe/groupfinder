import React, { useMemo, useState, useEffect } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import GroupFinderApi from "../../api";

function AddUser({ addUser }: AddUserProps) {
  const [inputValue, setInputValue] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const search = useMemo(
    () =>
      debounce(async (username: string) => {
        const options = await GroupFinderApi.getUsers(username);
        setUsers(options);
      }, 400),
    []
  );

  useEffect(() => {
    if (inputValue === "") {
      setUsers([]);
    } else if (!user) {
      search(inputValue);
    }
  }, [inputValue, search, user]);

  return (
    <Box
      data-testid="form-adduser"
      component="form"
      sx={{ display: "flex", justifyContent: "center" }}>
      <Autocomplete
        data-testid="autocomplete-adduser"
        sx={{ width: "100%" }}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.username
        }
        filterOptions={(x) => x}
        options={users}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={user}
        noOptionsText="Start typing to search for users..."
        onChange={(e: any, newValue: User | null) => {
          setUsers(newValue ? [newValue, ...users] : users);
          setUser(newValue);
        }}
        onInputChange={(e: any, newInputValue) => {
          setInputValue(newInputValue);
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
          addUser(user as User);
        }}>
        Add
      </Button>
    </Box>
  );
}

export default AddUser;
