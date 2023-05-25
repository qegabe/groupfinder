import express from "express";
import jsonschema from "jsonschema";
import userRegisterSchema from "../schemas/userRegister.json";
import { BadRequestError } from "../helpers/expressError";
import User from "../models/user";
import createToken from "../helpers/token";

const router = express.Router();

/**
 * POST /auth/register
 */
router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs.join("-"));
    }

    const { username, password }: { username: string; password: string } =
      req.body;
    const user = await User.register(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /auth/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs.join("-"));
    }

    const { username, password }: { username: string; password: string } =
      req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

export default router;
