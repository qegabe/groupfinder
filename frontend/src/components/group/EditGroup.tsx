import React, { useState, useEffect } from "react";
import { Alert, Box, Grid, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import GroupFinderApi from "../../api";
import GroupForm from "./GroupForm";
import LoadingSpinner from "../common/LoadingSpinner";
import AddGame from "../game/AddGame";
import GameList from "../game/GameList";
import AddUser from "../user/AddUser";
import UserList from "../user/UserList";

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
  const groupId = +(id as string);
  const [groupData, setGroupData] = useState<Group>(INITIAL_STATE as Group);
  const [alertData, setAlertData] = useState<any[]>([]);

  useEffect(() => {
    async function loadGroup() {
      const group = await GroupFinderApi.getGroup(groupId);
      setGroupData({
        ...group,
        maxMembers: group.maxMembers || undefined,
      });
    }
    loadGroup();
  }, [groupId, setGroupData]);

  async function submit() {
    await GroupFinderApi.editGroup(groupId, {
      title: groupData.title,
      description: groupData.description,
      startTime: groupData.startTime,
      endTime: groupData.endTime,
      isPrivate: groupData.isPrivate,
      maxMembers: groupData.maxMembers,
    });
  }

  async function addUser(user: User) {
    try {
      await GroupFinderApi.addUser(groupId, user.username);
      setGroupData((gd: Group) => ({
        ...gd,
        members: {
          ...gd.members,
          [user.username as keyof object]: {
            avatarUrl: user.avatarUrl,
            isOwner: false,
          },
        },
      }));
      setAlertData([{ severity: "success", text: `${user.username} added!` }]);
    } catch (error) {
      setAlertData([{ severity: "error", text: `Couldn't add user!` }]);
    }
  }

  async function removeUser(user: User) {
    try {
      await GroupFinderApi.removeUser(groupId, user.username);
      setGroupData((gd: Group) => {
        const members = { ...gd.members };
        delete members[user.username as keyof object];

        return {
          ...gd,
          members,
        };
      });
      setAlertData([
        { severity: "success", text: `${user.username} removed!` },
      ]);
    } catch (error) {
      setAlertData([{ severity: "error", text: `Couldn't remove user!` }]);
    }
  }

  async function addGame(game: Game) {
    try {
      await GroupFinderApi.addGame(groupId, game.id);
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
      await GroupFinderApi.removeGame(groupId, game.id);
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
      <Grid container spacing={2}>
        <Grid item sx={{ display: "grid", justifyContent: "center" }} xs={6}>
          <AddUser addUser={addUser} />
          <Box sx={{ my: 2 }}>
            <Typography>Users</Typography>
            <UserList userData={groupData.members} removeUser={removeUser} />
          </Box>
        </Grid>
        <Grid item sx={{ display: "grid", justifyContent: "center" }} xs={6}>
          <AddGame addGame={addGame} />
          <Box sx={{ my: 2 }}>
            <Typography>Games</Typography>
            <GameList gameData={groupData.games} removeGame={removeGame} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EditGroup;
