import express from "express";
import jsonschema from "jsonschema";
import userRegisterSchema from "../schemas/userRegister.json";
import { BadRequestError } from "../helpers/expressError";
import User from "../models/user";

const router = express.Router();

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
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

export default router;
