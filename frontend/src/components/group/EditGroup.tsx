import React, { useState, useEffect } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import GroupFinderApi from "../../api";
import GroupForm from "./GroupForm";
import LoadingSpinner from "../common/LoadingSpinner";
import AddGame from "../game/AddGame";
import GameList from "../game/GameList";

const INITIAL_STATE: GroupFormData = {
  title: "",
  description: "",
  startTime: null,
  endTime: null,
  isPrivate: false,
  maxMembers: undefined,
};

function EditGroup() {
  const { id } = useParams();
  const [groupData, setGroupData] = useState<Group>(INITIAL_STATE as Group);
  const [alertData, setAlertData] = useState<any[]>([]);

  useEffect(() => {
    async function loadGroup() {
      const group = await GroupFinderApi.getGroup(+(id as string));
      setGroupData({
        ...group,
        maxMembers: group.maxMembers || undefined,
      });
    }
    loadGroup();
  }, [id, setGroupData]);

  async function submit() {
    const groupId = +(id as string);
    await GroupFinderApi.editGroup(groupId, {
      title: groupData.title,
      description: groupData.description,
      startTime: groupData.startTime,
      endTime: groupData.endTime,
      isPrivate: groupData.isPrivate,
      maxMembers: groupData.maxMembers,
    });
  }

  async function addGame(game: Game) {
    try {
      await GroupFinderApi.addGame(+(id as string), game.id);
      setGroupData((gd: Group) => ({
        ...gd,
        games: [...(gd.games as Game[]), game],
      }));
      setAlertData([{ severity: "success", text: `${game.title} added!` }]);
    } catch (error) {
      setAlertData([{ severity: "error", text: `Couldn't add game!` }]);
    }
  }

  async function removeGame(game: Game) {
    try {
      await GroupFinderApi.removeGame(+(id as string), game.id);
      setGroupData((gd: Group) => ({
        ...gd,
        games: (gd.games as Game[]).filter((g) => g.id !== game.id),
      }));
      setAlertData([{ severity: "success", text: `${game.title} removed!` }]);
    } catch (error) {
      setAlertData([{ severity: "error", text: `Couldn't remove game!` }]);
    }
  }

  //Alerts
  const alerts = alertData.map((a) => (
    <Alert key={a.text} severity={a.severity}>
      {a.text}
    </Alert>
  ));

  //Loading spinner if group not loaded
  if (groupData.title === "") return <LoadingSpinner />;

  return (
    <Box sx={{ display: "grid", justifyItems: "center" }}>
      <Typography variant="h3">Edit Group</Typography>
      {alerts}
      <GroupForm
        initialState={INITIAL_STATE}
        formData={groupData as GroupFormData}
        setFormData={setGroupData}
        submit={submit}
        returnPath="/groups"
        shouldReturn={false}
        buttons={{ submit: "Save", cancel: "Cancel" }}
      />
      <AddGame addGame={addGame} />
      <Box sx={{ my: 2 }}>
        <Typography>Games</Typography>
        <GameList gameData={groupData.games} removeGame={removeGame} />
      </Box>
    </Box>
  );
}

export default EditGroup;
