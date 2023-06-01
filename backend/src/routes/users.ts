import express from "express";
import User from "../models/user";
import jsonschema from "jsonschema";
import { BadRequestError } from "../helpers/expressError";
import userUpdateSchema from "../schemas/userUpdate.json";
import { ensureCorrectUser } from "../middleware/auth";

const router = express.Router();

/**
 * GET /api/users/
 */
router.get("/", async (req, res, next) => {
  try {
    const users = await User.getList();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/users/:username
 */
router.get("/:username", async (req, res, next) => {
  try {
    const user = await User.getByUsername(req.params.username);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

/**
 * PATCH /api/users/:username
 */
router.patch("/:username", ensureCorrectUser, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(JSON.stringify(errs));
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/users/:username
 */
router.delete("/:username", ensureCorrectUser, async (req, res, next) => {
  try {
    await User.remove(req.params.username);
    return res.json({ message: `User ${req.params.username} removed` });
  } catch (error) {
    return next(error);
  }
});

export default router;
