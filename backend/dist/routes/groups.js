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
const group_1 = __importDefault(require("../models/group"));
const jsonschema_1 = __importDefault(require("jsonschema"));
const expressError_1 = require("../helpers/expressError");
const groupCreate_json_1 = __importDefault(require("../schemas/groupCreate.json"));
const groupUpdate_json_1 = __importDefault(require("../schemas/groupUpdate.json"));
const groupFilter_json_1 = __importDefault(require("../schemas/groupFilter.json"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * POST /api/groups/
 */
router.post("/", auth_1.ensureLoggedIn, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validator = jsonschema_1.default.validate(req.body, groupCreate_json_1.default);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new expressError_1.BadRequestError(JSON.stringify(errs));
        }
        const group = yield group_1.default.create(res.locals.user.username, req.body);
        return res.status(201).json({ group });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * GET /api/groups/
 */
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validator = jsonschema_1.default.validate(req.query, groupFilter_json_1.default);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new expressError_1.BadRequestError(JSON.stringify(errs));
        }
        const groups = yield group_1.default.getList(req.query, (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.username);
        return res.json({ groups });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * GET /api/groups/cities
 */
router.get("/cities", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.name) {
            req.query.name = "";
        }
        const cities = yield group_1.default.getCities(req.query.name);
        return res.json({ cities });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * GET /api/groups/:id
 */
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        const group = yield group_1.default.getById(id);
        //Only members of a private group can view its details
        if (group.isPrivate &&
            (!res.locals.user ||
                !group.members.hasOwnProperty(res.locals.user.username))) {
            throw new expressError_1.UnauthorizedError(`You are not a member of group with id: ${group.id}`);
        }
        return res.json({ group });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * PATCH /api/groups/:id
 */
router.patch("/:id", auth_1.ensureIsOwner, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validator = jsonschema_1.default.validate(req.body, groupUpdate_json_1.default);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new expressError_1.BadRequestError(JSON.stringify(errs));
        }
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        const group = yield group_1.default.update(+req.params.id, req.body);
        return res.json({ group });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * DELETE /api/groups/:id
 */
router.delete("/:id", auth_1.ensureIsOwner, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        yield group_1.default.remove(+req.params.id);
        return res.json({ message: `Group with id: ${req.params.id} removed` });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /api/groups/:id/join
 */
router.post("/:id/join", auth_1.ensureLoggedIn, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        const username = res.locals.user.username;
        yield group_1.default.join(username, +req.params.id);
        return res.json({
            message: `User ${username} joined group with id: ${req.params.id}`,
        });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /api/groups/:id/leave
 */
router.post("/:id/leave", auth_1.ensureLoggedIn, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        const username = res.locals.user.username;
        yield group_1.default.leave(username, +req.params.id);
        return res.json({
            message: `User ${username} left group with id: ${req.params.id}`,
        });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /api/groups/:id/add/:username
 */
router.post("/:id/add/:username", auth_1.ensureIsOwner, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        const username = req.params.username;
        yield group_1.default.join(username, +req.params.id);
        return res.json({
            message: `User ${username} was added to group with id: ${req.params.id}`,
        });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /api/groups/:id/remove/:username
 */
router.post("/:id/remove/:username", auth_1.ensureIsOwner, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        if (isNaN(id))
            throw new expressError_1.BadRequestError(`'${req.params.id}' is not a valid group id`);
        const username = req.params.username;
        yield group_1.default.leave(username, +req.params.id);
        return res.json({
            message: `User ${username} was removed from group with id: ${req.params.id}`,
        });
    }
    catch (error) {
        return next(error);
    }
}));
exports.default = router;
//# sourceMappingURL=groups.js.map