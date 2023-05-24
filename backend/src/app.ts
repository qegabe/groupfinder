import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";
import { ExpressError, NotFoundError } from "./helpers/expressError";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";

const app = express();

app.use(express.json());
app.use(morgan("tiny"));

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);

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
