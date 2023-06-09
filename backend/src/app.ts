import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";
import cors from "cors";
import { ExpressError, NotFoundError } from "./helpers/expressError";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import groupRoutes from "./routes/groups";
import gameRoutes from "./routes/games";
import { authenticateJWT } from "./middleware/auth";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/games", gameRoutes);

/** Handle 404 errors -- this matches everything */
app.use((req, res, next) => {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
const errorHandler: ErrorRequestHandler = (
  err: ExpressError,
  req,
  res,
  next
) => {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
};
app.use(errorHandler);

export default app;
