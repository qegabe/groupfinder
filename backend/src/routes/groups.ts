import express from "express";
import Group from "../models/group";
import jsonschema from "jsonschema";
import { BadRequestError } from "../helpers/expressError";
import groupCreateSchema from "../schemas/groupCreate.json";
import groupUpdateSchema from "../schemas/groupUpdate.json";
import groupFilterSchema from "../schemas/groupFilter.json";
import { ensureIsOwner, ensureLoggedIn } from "../middleware/auth";

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

/**
 * GET /api/groups/
 */
router.get("/", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.query, groupFilterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs.join("-"));
    }

    const groups = await Group.getList(100, req.query);
    return res.json({ groups });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/groups/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const group = await Group.getById(+req.params.id);
    return res.json({ group });
  } catch (error) {
    return next(error);
  }
});

/**
 * PATCH /api/groups/:id
 */
router.patch("/:id", ensureIsOwner, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, groupUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs.join("-"));
    }

    const group = await Group.update(+req.params.id, req.body);
    return res.json({ group });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/groups/:id
 */
router.delete("/:id", ensureIsOwner, async (req, res, next) => {
  try {
    await Group.remove(+req.params.id);
    return res.json({ message: `Group with id: ${req.params.id} removed` });
  } catch (error) {
    return next(error);
  }
});

export default router;
