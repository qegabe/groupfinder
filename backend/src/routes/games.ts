import express from "express";
import Game from "../models/game";
import jsonschema from "jsonschema";
import gameSearchSchema from "../schemas/gameSearch.json";
import { BadRequestError } from "../helpers/expressError";
import { ensureLoggedIn, ensureIsOwner } from "../middleware/auth";

const router = express.Router();

/**
 * GET /api/games/
 */
router.get("/", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.query, gameSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(JSON.stringify(errs));
    }

    const games = await Game.search(req.query.search as string);
    return res.json({ games });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/games/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid game id`);

    const game = await Game.findOrAdd(id);
    return res.json({ game });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/games/:id/favorite
 */
router.post("/:id/favorite", ensureLoggedIn, async (req, res, next) => {
  try {
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid game id`);

    await Game.addFavorite(res.locals.user.username, id);
    return res.json({ message: `Game: ${id} added to favorites` });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/games/:id/unfavorite
 */
router.post("/:id/unfavorite", ensureLoggedIn, async (req, res, next) => {
  try {
    const id = +req.params.id;
    if (isNaN(id))
      throw new BadRequestError(`'${req.params.id}' is not a valid game id`);

    await Game.removeFavorite(res.locals.user.username, id);
    return res.json({ message: `Game: ${id} removed from favorites` });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/games/:gameId/add/:id
 */
router.post("/:gameId/add/:id", ensureIsOwner, async (req, res, next) => {
  try {
    const gameId = +req.params.gameId;
    if (isNaN(gameId))
      throw new BadRequestError(
        `'${req.params.gameId}' is not a valid game id`
      );
    const groupId = +req.params.id;
    if (isNaN(groupId))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

    await Game.addToGroup(groupId, gameId);
    return res.json({ message: `Game: ${gameId} added to group: ${groupId}` });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/games/:gameId/remove/:id
 */
router.post("/:gameId/remove/:id", ensureIsOwner, async (req, res, next) => {
  try {
    const gameId = +req.params.gameId;
    if (isNaN(gameId))
      throw new BadRequestError(
        `'${req.params.gameId}' is not a valid game id`
      );
    const groupId = +req.params.id;
    if (isNaN(groupId))
      throw new BadRequestError(`'${req.params.id}' is not a valid group id`);

    await Game.removeFromGroup(groupId, gameId);
    return res.json({
      message: `Game: ${gameId} removed from group: ${groupId}`,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
