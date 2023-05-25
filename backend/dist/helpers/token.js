"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function createToken(user) {
    const payload = {
        username: user.username,
    };
    return jsonwebtoken_1.default.sign(payload, config_1.SECRET_KEY);
}
exports.default = createToken;
//# sourceMappingURL=token.js.map