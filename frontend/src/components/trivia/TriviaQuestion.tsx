import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import LoadingSpinner from "../common/LoadingSpinner";
import TriviaTimer from "./TriviaTimer";

function TriviaQuestion({
  selectedAnswer,
  correctAnswer,
  question,
  sendAnswer,
  nextQuestion,
}: TriviaQuestionProps) {
  if (question === undefined) return <LoadingSpinner />;

  let colors: ("primary" | "secondary" | "success")[] = [
    "primary",
    "primary",
    "primary",
    "primary",
  ];
  if (selectedAnswer !== undefined) {
    colors[selectedAnswer] = "secondary";
  }

  if (correctAnswer !== undefined) {
    const idx = question.answers.indexOf(correctAnswer);
    colors[idx] = "success";
  }

  return (
    <Box sx={{ width: "100%", mx: { xs: 0, md: 3 } }}>
      <Box sx={{ display: "grid", my: { xs: 0, md: 4 }, alignItems: "center" }}>
        <Box justifySelf="left" mt={1}>
          <TriviaTimer key={question.question} initialTime={60} />
        </Box>
        <Typography
          sx={{
            textTransform: "capitalize",
            justifySelf: "center",
            fontSize: { xs: "1rem", md: "2rem" },
          }}>
          {question.category.replaceAll("_", " ")}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <Typography
          sx={{ fontSize: { xs: "1.25rem", md: "1.75rem", lg: "3rem" } }}>
          {question.question}
        </Typography>
      </Box>
      <Grid
        container
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-evenly"
        wrap="nowrap"
        spacing={2}>
        <Grid item container direction="column">
          <Button
            sx={{ mb: 2, minHeight: 64 }}
            size="large"
            variant="contained"
            color={colors[0]}
            onClick={() => {
              if (selectedAnswer === undefined) sendAnswer(0);
            }}>
            {question.answers[0]}
          </Button>
          <Button
            sx={{ minHeight: 64 }}
            size="large"
            variant="contained"
            color={colors[2]}
            onClick={() => {
              if (selectedAnswer === undefined) sendAnswer(2);
            }}>
            {question.answers[2]}
          </Button>
        </Grid>
        <Grid item container direction="column">
          <Button
            sx={{ mb: 2, minHeight: 64 }}
            size="large"
            variant="contained"
            color={colors[1]}
            onClick={() => {
              if (selectedAnswer === undefined) sendAnswer(1);
            }}>
            {question.answers[1]}
          </Button>
          <Button
            sx={{ minHeight: 64 }}
            size="large"
            variant="contained"
            color={colors[3]}
            onClick={() => {
              if (selectedAnswer === undefined) sendAnswer(3);
            }}>
            {question.answers[3]}
          </Button>
        </Grid>
      </Grid>
      {correctAnswer ? (
        <Box
          sx={{
            mt: { xs: 2, md: 4, lg: 10 },
            display: "flex",
            justifyContent: "center",
          }}>
          <Button size="large" variant="contained" onClick={nextQuestion}>
            Next Question
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}

export default TriviaQuestion;
