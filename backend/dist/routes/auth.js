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
const jsonschema_1 = __importDefault(require("jsonschema"));
const userRegister_json_1 = __importDefault(require("../schemas/userRegister.json"));
const userAuth_json_1 = __importDefault(require("../schemas/userAuth.json"));
const expressError_1 = require("../helpers/expressError");
const user_1 = __importDefault(require("../models/user"));
const token_1 = __importDefault(require("../helpers/token"));
const router = express_1.default.Router();
/**
 * POST /auth/register
 */
router.post("/register", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validator = jsonschema_1.default.validate(req.body, userRegister_json_1.default);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new expressError_1.BadRequestError(JSON.stringify(errs));
        }
        const { username, password } = req.body;
        const user = yield user_1.default.register(username, password);
        const token = (0, token_1.default)(user);
        return res.json({ token });
    }
    catch (error) {
        return next(error);
    }
}));
/**
 * POST /auth/login
 */
router.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validator = jsonschema_1.default.validate(req.body, userAuth_json_1.default);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new expressError_1.BadRequestError(JSON.stringify(errs));
        }
        const { username, password } = req.body;
        const user = yield user_1.default.authenticate(username, password);
        const token = (0, token_1.default)(user);
        return res.json({ token });
    }
    catch (error) {
        return next(error);
    }
}));
exports.default = router;
//# sourceMappingURL=auth.js.map