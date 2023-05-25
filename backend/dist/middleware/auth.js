"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCorrectUser = exports.ensureLoggedIn = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const expressError_1 = require("../helpers/expressError");
function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jsonwebtoken_1.default.verify(token, config_1.SECRET_KEY);
        }
        return next();
    }
    catch (err) {
        return next();
    }
}
exports.authenticateJWT = authenticateJWT;
function ensureLoggedIn(req, res, next) {
    try {
        if (!res.locals.user)
            throw new expressError_1.UnauthorizedError();
        return next();
    }
    catch (error) {
        next(error);
    }
}
exports.ensureLoggedIn = ensureLoggedIn;
function ensureCorrectUser(req, res, next) {
    try {
        if (!res.locals.user || req.params.username !== res.locals.user.username) {
            throw new expressError_1.UnauthorizedError();
        }
        return next();
    }
    catch (error) {
        next(error);
    }
}
exports.ensureCorrectUser = ensureCorrectUser;
//# sourceMappingURL=auth.js.map