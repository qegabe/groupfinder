"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const game_1 = __importDefault(require("../models/game"));
const jsonschema_1 = __importDefault(require("jsonschema"));
const gameSearch_json_1 = __importDefault(require("../schemas/gameSearch.json"));
const expressError_1 = require("../helpers/expressError");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * GET /api/games/
 */
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validator = jsonschema_1.default.validate(req.query, gameSearch_json_1.default);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new expressError_1.BadRequestError(JSON.stringify(errs));
        }
        const games = yield game_1.default.search(req.query.search);
        return res.json({ games });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * GET /api/games/:id
 */
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid game id`);
        const game = yield game_1.default.findOrAdd(id);
        return res.json({ game });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /api/games/:id/favorite
 */
router.post("/:id/favorite", auth_1.ensureLoggedIn, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid game id`);
        yield game_1.default.addFavorite(res.locals.user.username, id);
        return res.json({ message: `Game: ${id} added to favorites` });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /api/games/:id/unfavorite
 */
router.post("/:id/unfavorite", auth_1.ensureLoggedIn, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid game id`);
        yield game_1.default.removeFavorite(res.locals.user.username, id);
        return res.json({ message: `Game: ${id} removed from favorites` });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /api/games/:gameId/add/:id
 */
router.post("/:gameId/add/:id", auth_1.ensureIsOwner, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gameId = +req.params.gameId;
        if (isNaN(gameId))
            throw new expressError_1.BadRequestError(`'${req.params.gameId}' is not a valid game id`);
        const groupId = +req.params.id;
        if (isNaN(groupId))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        yield game_1.default.addToGroup(groupId, gameId);
        return res.json({ message: `Game: ${gameId} added to group: ${groupId}` });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /api/games/:gameId/remove/:id
 */
router.post("/:gameId/remove/:id", auth_1.ensureIsOwner, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gameId = +req.params.gameId;
        if (isNaN(gameId))
            throw new expressError_1.BadRequestError(`'${req.params.gameId}' is not a valid game id`);
        const groupId = +req.params.id;
        if (isNaN(groupId))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        yield game_1.default.removeFromGroup(groupId, gameId);
        return res.json({
            message: `Game: ${gameId} removed from group: ${groupId}`,
        });
    }
    catch (error) {
        return next(error);
    }
}));
exports.default = router;
//# sourceMappingURL=games.js.map