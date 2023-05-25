import express from "express";
import Group from "../models/group";
import jsonschema from "jsonschema";
import { BadRequestError } from "../helpers/expressError";
import groupCreateSchema from "../schemas/groupCreate.json";
import { ensureLoggedIn } from "../middleware/auth";

const router = express.Router();

/**
 * POST /api/groups/
 */
router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, groupCreateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs.join("-"));
    }
    const group = await Group.create(res.locals.user.username, req.body);
    return res.json({ group });
  } catch (error) {
    return next(error);
  }
});

export default router;
