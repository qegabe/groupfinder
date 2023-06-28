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

function AddGame({ addGame }: AddGameProps) {
  const [inputValue, setInputValue] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  const search = useMemo(
    () =>
      debounce(async (term: string) => {
        const options = await GroupFinderApi.searchGame(term);
        setGames(options);
      }, 1000),
    []
  );

  useEffect(() => {
    if (inputValue === "") {
      setGames([]);
    } else if (!game) {
      search(inputValue);
    }
  }, [inputValue, search, game]);

  return (
    <Box
      data-testid="div-addgame"
      sx={{ display: "flex", justifyContent: "center" }}>
      <Autocomplete
        data-testid="autocomplete-addgame"
        sx={{ width: "100%" }}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.title
        }
        filterOptions={(x) => x}
        options={games}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={game}
        noOptionsText="Start typing to search for games..."
        onChange={(e: any, newValue: Game | null) => {
          setGames(newValue ? [newValue, ...games] : games);
          setGame(newValue);
        }}
        onInputChange={(e: any, newInputValue) => {
          setInputValue(newInputValue);
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
          addGame(game as Game);
        }}>
        Add
      </Button>
    </Box>
  );
}

export default AddGame;
