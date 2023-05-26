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
const user_1 = __importDefault(require("../models/user"));
const jsonschema_1 = __importDefault(require("jsonschema"));
const expressError_1 = require("../helpers/expressError");
const userUpdate_json_1 = __importDefault(require("../schemas/userUpdate.json"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * GET /api/users/
 */
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.getList();
        return res.json({ users });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * GET /api/users/:username
 */
router.get("/:username", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.getByUsername(req.params.username);
        return res.json({ user });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * PATCH /api/users/:username
 */
router.patch("/:username", auth_1.ensureCorrectUser, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validator = jsonschema_1.default.validate(req.body, userUpdate_json_1.default);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new expressError_1.BadRequestError(errs.join("-"));
        }
        const user = yield user_1.default.update(req.params.username, req.body);
        return res.json({ user });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * DELETE /api/users/:username
 */
router.delete("/:username", auth_1.ensureCorrectUser, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_1.default.remove(req.params.username);
        return res.json({ message: `User ${req.params.username} removed` });
    }
    catch (error) {
        return next(error);
    }
}));
exports.default = router;
//# sourceMappingURL=users.js.map