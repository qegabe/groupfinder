import React, { useState } from "react";
import { Box, Button, Slider, Stack, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import AddGame from "../game/AddGame";
import GameList from "../game/GameList";

function GroupFilter({ formData, setFormData }: GroupFilterProps) {
  const [games, setGames] = useState<Game[]>([]);

  function handleSliderChange(evt: Event, value: number | number[]) {
    setFormData((fd: any) => ({
      ...fd,
      maxSize: value,
    }));
  }

  function setTimeData(value: Dayjs | null, prop: string) {
    setFormData((fd: any) => ({
      ...fd,
      [prop]: value,
    }));
  }

  function reset() {
    setFormData({
      startTimeAfter: null,
      startTimeBefore: null,
      maxSize: 10,
    });
    setGames([]);
  }

  function addGame(game: Game) {
    setFormData((fd: any) => ({
      ...fd,
      hasGames: [...fd.hasGames, game.id],
    }));
    setGames((g: Game[]) => [...g, game]);
  }

  function removeGame(game: Game) {
    setFormData((fd: any) => ({
      ...fd,
      hasGames: fd.hasGames.filter((id: number) => id !== game.id),
    }));
    setGames((gam: Game[]) => gam.filter((g) => g.id !== game.id));
  }

  return (
    <Stack
      spacing={2}
      sx={{
        boxShadow: 1,
      }}>
      <Box
        component="form"
        sx={{
          display: "grid",
          justifyItems: "center",
        }}>
        <Typography variant="h6" sx={{ my: 2 }}>
          Filter Groups
        </Typography>
        <Button variant="outlined" onClick={reset} sx={{ my: 2 }}>
          Reset
        </Button>
        <DateTimePicker
          label="Starting Before"
          sx={{ my: 1 }}
          value={formData.startTimeBefore}
          onChange={(v) => setTimeData(v, "startTimeBefore")}
        />
        <DateTimePicker
          label="Starting After"
          sx={{ my: 1 }}
          value={formData.startTimeAfter}
          onChange={(v) => setTimeData(v, "startTimeAfter")}
        />
        <Box>
          <Typography gutterBottom>Max Members</Typography>
          <Slider
            id="maxSize"
            aria-label="Max Members"
            valueLabelDisplay="auto"
            defaultValue={10}
            min={1}
            max={50}
            sx={{ width: 250 }}
            value={formData.maxSize}
            onChange={handleSliderChange}
          />
        </Box>
      </Box>
      <Box sx={{ padding: "0 10%" }}>
        <AddGame addGame={addGame} />
        <Box sx={{ my: 2 }}>
          <GameList gameData={games} removeGame={removeGame} />
        </Box>
      </Box>
    </Stack>
  );
}

export default GroupFilter;
