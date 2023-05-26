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
exports.ensureIsOwner = exports.ensureCorrectUser = exports.ensureLoggedIn = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const expressError_1 = require("../helpers/expressError");
const group_1 = __importDefault(require("../models/group"));
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
function ensureIsOwner(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!res.locals.user ||
                !(yield group_1.default.isOwner(+req.params.id, res.locals.user.username))) {
                throw new expressError_1.UnauthorizedError();
            }
            return next();
        }
        catch (error) {
            next(error);
        }
    });
}
exports.ensureIsOwner = ensureIsOwner;
//# sourceMappingURL=auth.js.map