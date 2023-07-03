import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Button,
  Tooltip,
  Typography,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CommentIcon from "@mui/icons-material/Comment";
import CloseIcon from "@mui/icons-material/Close";
import GroupFinderApi from "../../api";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAppSelector } from "../../hooks/redux";
import GameList from "../game/GameList";
import UserList from "../user/UserList";
import SomethingWentWrong from "../common/SomethingWentWrong";
import GroupChat from "./GroupChat";
import { theme } from "../../theme";
import { shallowEqual } from "react-redux";
dayjs.extend(duration);
dayjs.extend(relativeTime);

function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState<Group>();
  const [isPrivate, setIsPrivate] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const user = useAppSelector((s) => s.auth.user, shallowEqual);
  const authLoading = useAppSelector((s) => s.auth.loading);

  useEffect(() => {
    async function loadGroup() {
      try {
        setGroup(await GroupFinderApi.getGroup(+(id as string)));
      } catch (error: any) {
        if (error === `You are not a member of group with id: ${id}`) {
          setIsPrivate(true);
        } else {
          setIsError(true);
        }
      }
    }
    if (!authLoading) {
      loadGroup();
    }
  }, [id, authLoading]);

  async function joinGroup() {
    try {
      await GroupFinderApi.joinGroup(+(id as string));
      if (group && user) {
        setGroup(
          (g) =>
            ({
              ...g,
              members: {
                ...g?.members,
                [user.username]: { avatarUrl: user.avatarUrl, isOwner: false },
              },
            } as Group)
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function leaveGroup() {
    try {
      await GroupFinderApi.leaveGroup(+(id as string));
      if (group && user) {
        setGroup((g) => {
          const members = g?.members;
          if (members) {
            delete members[user.username];
          }
          return {
            ...g,
            members,
          } as Group;
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (isError) return <SomethingWentWrong />;

  if (isPrivate) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 68px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Typography sx={{ fontSize: { xs: "1.75rem", md: "3rem" } }}>
          This group is private!
        </Typography>
      </Box>
    );
  }

  if (!group) return <LoadingSpinner />;

  const isMember = Boolean(group.members[user?.username as keyof object]);
  const isOwner = Boolean(
    group.members[user?.username as keyof object]?.isOwner
  );

  const hasTrivia = group.games.some((g) => g.id === -1);

  return (
    <>
      <Grid container spacing={2} direction={{ xs: "column", md: "row" }}>
        <Grid item container direction="column" xs={12} md={8}>
          <Grid item container justifyContent="space-between" sx={{ px: 1 }}>
            <Box display="flex" alignItems="center">
              <Typography
                variant="h3"
                sx={{ mt: 2, textTransform: "capitalize" }}>
                {group.title}
              </Typography>
              {isOwner ? (
                <Tooltip title="Edit">
                  <IconButton
                    sx={{ mt: 2, height: 40, width: 40 }}
                    component={Link}
                    to={`/groups/${id}/edit`}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              {isMember && !isOwner ? (
                <Button variant="contained" onClick={leaveGroup}>
                  Leave Group
                </Button>
              ) : null}
              {!isMember && user ? (
                <Button variant="contained" onClick={joinGroup}>
                  Join Group
                </Button>
              ) : null}
            </Box>
          </Grid>
          <Grid item sx={{ px: 1 }}>
            <hr />
            <Box>
              {group.cityId ? (
                <Typography>
                  Location: {group.address}, {group.city}
                </Typography>
              ) : null}
              <Typography>
                Starting at: {group.startTime.format("LLL")}
              </Typography>
              <Typography>
                Lasts{" "}
                {dayjs.duration(group.endTime.diff(group.startTime)).humanize()}
              </Typography>
            </Box>
          </Grid>
          <Grid item sx={{ px: 1 }}>
            <hr />
            <Box sx={{ my: 2 }}>
              <Typography sx={{ fontStyle: "italic" }}>
                {group.description}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Grid item container direction="column" md={4}>
          {hasTrivia && isMember ? (
            <Grid item container justifyContent="center">
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                component={Link}
                to={`/games/trivia/${id}`}>
                Play Trivia
              </Button>
            </Grid>
          ) : null}
          <Grid item sx={{ px: 1 }}>
            <Box sx={{ my: 2 }}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="users-content"
                  id="users-header">
                  <Typography>Users</Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    pt: 2,
                  }}>
                  <UserList userData={group.members} />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="games-content"
                  id="games-header">
                  <Typography>Games</Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    pt: 2,
                  }}>
                  <GameList gameData={group.games} />
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>
        </Grid>
      </Grid>
      {isMember ? (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}>
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <Tooltip title={showChat ? "Close" : "Chat"}>
              <IconButton
                aria-label={showChat ? "close" : "chat"}
                sx={{ width: { xs: 48, md: 72 }, height: { xs: 48, md: 72 } }}
                onClick={() => {
                  setShowChat(!showChat);
                }}>
                {showChat ? (
                  <CloseIcon
                    sx={{ transform: { xs: "scale(1)", md: "scale(1.5)" } }}
                  />
                ) : (
                  <CommentIcon
                    sx={{ transform: { xs: "scale(1)", md: "scale(1.5)" } }}
                  />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Collapse in={showChat}>
            <Box
              sx={{
                width: { xs: 300, md: 500 },
                height: { xs: 300, md: 500 },
                backgroundColor: theme.palette.background.default,
              }}>
              <GroupChat />
            </Box>
          </Collapse>
        </Box>
      ) : null}
    </>
  );
}

export default GroupDetail;
