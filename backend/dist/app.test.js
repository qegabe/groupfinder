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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./db"));
it("not found for site 404", () => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield (0, supertest_1.default)(app_1.default).get("/no-such-path");
    expect(resp.statusCode).toEqual(404);
}));
it("not found for site 404 (test stack print)", () => __awaiter(void 0, void 0, void 0, function* () {
    process.env.NODE_ENV = "";
    const resp = yield (0, supertest_1.default)(app_1.default).get("/no-such-path");
    expect(resp.statusCode).toEqual(404);
    delete process.env.NODE_ENV;
}));
afterAll(function () {
    db_1.default.end();
});
//# sourceMappingURL=app.test.js.map