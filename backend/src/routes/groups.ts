import express from "express";
import Group from "../models/group";
import jsonschema from "jsonschema";
import { BadRequestError, UnauthorizedError } from "../helpers/expressError";
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
      throw new BadRequestError(JSON.stringify(errs));
    }
    const group = await Group.create(res.locals.user.username, req.body);
    return res.status(201).json({ group });
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
      throw new BadRequestError(JSON.stringify(errs));
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
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

    const group = await Group.getById(id);

    //Only members of a private group can view its details
    if (
      group.isPrivate &&
      (!res.locals.user ||
        !group.members.hasOwnProperty(res.locals.user.username))
    ) {
      throw new UnauthorizedError(
        `You are not a member of group with id: ${group.id}`
      );
    }

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
      throw new BadRequestError(JSON.stringify(errs));
    }
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

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
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

    await Group.remove(+req.params.id);
    return res.json({ message: `Group with id: ${req.params.id} removed` });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/groups/:id/join
 */
router.post("/:id/join", ensureLoggedIn, async (req, res, next) => {
  try {
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

    const username = res.locals.user.username;
    await Group.join(username, +req.params.id);
    return res.json({
      message: `User ${username} joined group with id: ${req.params.id}`,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/groups/:id/leave
 */
router.post("/:id/leave", ensureLoggedIn, async (req, res, next) => {
  try {
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

    const username = res.locals.user.username;
    await Group.leave(username, +req.params.id);
    return res.json({
      message: `User ${username} left group with id: ${req.params.id}`,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/groups/:id/add/:username
 */
router.post("/:id/add/:username", ensureIsOwner, async (req, res, next) => {
  try {
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

    const username = req.params.username;
    await Group.join(username, +req.params.id);
    return res.json({
      message: `User ${username} was added to group with id: ${req.params.id}`,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/groups/:id/remove/:username
 */
router.post("/:id/remove/:username", ensureIsOwner, async (req, res, next) => {
  try {
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

    const username = req.params.username;
    await Group.leave(username, +req.params.id);
    return res.json({
      message: `User ${username} was removed from group with id: ${req.params.id}`,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
