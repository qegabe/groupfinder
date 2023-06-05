"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("./token"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
describe("createToken", () => {
    it("creates a token", () => {
        const token = (0, token_1.default)({ username: "test" });
        const payload = jsonwebtoken_1.default.verify(token, config_1.SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "test",
        });
    });
});
//# sourceMappingURL=token.test.js.map