import React, { useMemo, useState, useEffect } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  Button,
  Grid,
  TextField,
  Typography,
  debounce,
} from "@mui/material";
import GroupFinderApi from "../../api";
import { useAppDispatch } from "../../hooks/redux";
import { setAlert } from "../../actions/actionCreators";

interface AddGameState {
  inputValue: string;
  game: Game | null;
  games: Game[];
  loading: boolean;
}

function AddGame({ addGame }: AddGameProps) {
  const [state, setState] = useState<AddGameState>({
    inputValue: "",
    game: null,
    games: [],
    loading: false,
  });
  const dispatch = useAppDispatch();

  const search = useMemo(
    () =>
      debounce(async (term: string) => {
        try {
          const options = await GroupFinderApi.searchGame(term);
          setState((s) => ({
            ...s,
            games: options,
            loading: false,
          }));
        } catch (error) {
          console.error(error);
          setState((s) => ({ ...s, loading: false }));
          dispatch(setAlert("error", "Couldn't get games"));
        }
      }, 1000),
    []
  );

  useEffect(() => {
    if (state.inputValue === "") {
      setState((s) => ({
        ...s,
        games: [],
      }));
    } else if (!state.game) {
      setState((s) => ({
        ...s,
        loading: true,
      }));
      search(state.inputValue);
    }
  }, [state.inputValue, search, state.game]);

  return (
    <Box
      data-testid="div-addgame"
      sx={{ display: "flex", justifyContent: "center" }}>
      <Autocomplete
        loading={state.loading}
        loadingText={<CircularProgress />}
        data-testid="autocomplete-addgame"
        sx={{ width: "100%" }}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.title
        }
        filterOptions={(x) => x}
        options={state.games}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={state.game}
        noOptionsText="Start typing to search for games..."
        onChange={(e: any, newValue: Game | null) => {
          setState((s) => ({
            ...s,
            games: newValue ? [newValue, ...s.games] : s.games,
            game: newValue,
          }));
        }}
        onInputChange={(e: any, newInputValue) => {
          setState((s) => ({
            ...s,
            inputValue: newInputValue,
          }));
        }}
        renderInput={(params) => (
          <TextField {...params} label="Add a game" fullWidth />
        )}
        renderOption={(props, game) => {
          return (
            <li {...props}>
              <Grid container alignItems="center">
                <Grid item sx={{ display: "flex", width: 44 }}>
                  <Avatar
                    variant="square"
                    sx={{ width: 30, height: 30, mr: 1 }}
                    src={
                      game.coverUrl !== ""
                        ? game.coverUrl
                        : "/game-controller.png"
                    }
                  />
                </Grid>
                <Grid item sx={{ width: "calc(100% - 44px)" }}>
                  <Typography>{game.title}</Typography>
                </Grid>
              </Grid>
            </li>
          );
        }}
      />
      <Button
        variant="contained"
        onClick={() => {
          if (state.game) addGame(state.game);
        }}>
        Add
      </Button>
    </Box>
  );
}

export default AddGame;
