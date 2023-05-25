import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../helpers/expressError";

function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (error) {
    next(error);
  }
}

function ensureCorrectUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!res.locals.user || req.params.username !== res.locals.user.username) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (error) {
    next(error);
  }
}

export { authenticateJWT, ensureLoggedIn, ensureCorrectUser };
