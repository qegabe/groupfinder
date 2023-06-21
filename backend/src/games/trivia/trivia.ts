import express from "express";
import TriviaUser from "./triviauser";

const router = express.Router();

router.ws("/:id", async (ws, req, next) => {
  try {
    const user = new TriviaUser(ws.send.bind(ws), +req.params.id);

    ws.on("message", (message) => {
      try {
        user.handleMessage(message);
      } catch (error) {
        console.error(error);
      }
    });

    ws.on("close", () => {
      try {
        user.handleClose();
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    console.error(error);
  }
});

export default router;
