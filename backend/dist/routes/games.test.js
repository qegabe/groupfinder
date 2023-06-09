"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const app_1 = __importDefault(require("../app"));
const _testCommon_1 = require("./_testCommon");
const igdb = __importStar(require("../helpers/igdb"));
const mockrequest = jest
    .spyOn(igdb, "requestIGDB")
    .mockImplementation((endpoint, data) => __awaiter(void 0, void 0, void 0, function* () {
    switch (endpoint) {
        case "games":
            if (data === "fields name,cover; where id = (0);") {
                return [];
            }
            return [{ id: 3, name: "game3", cover: 3 }];
        case "covers":
            return [{ id: 3, url: "//www.img.com/test.png" }];
        case "search":
            return [{ id: 0, game: 3 }];
        default:
            return [];
    }
}));
beforeAll(_testCommon_1.commonBeforeAll);
beforeEach(_testCommon_1.commonBeforeEach);
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _testCommon_1.commonAfterEach)();
    mockrequest.mockClear();
}));
afterAll(_testCommon_1.commonAfterAll);
/****************************************** GET /api/games */
describe("GET /api/games", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .get("/api/games")
            .query({ search: "game3" });
        expect(resp.body).toEqual({
            games: [
                {
                    id: 3,
                    title: "game3",
                    coverUrl: "https://www.img.com/test.png",
                },
            ],
        });
    }));
    it("bad request with missing data", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get("/api/games").query({});
        expect(resp.statusCode).toEqual(400);
    }));
});
/****************************************** GET /api/games/:id */
describe("GET /api/games/:id", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get(`/api/games/1`);
        expect(resp.body).toEqual({
            game: {
                id: 1,
                title: "game1",
                coverUrl: "",
            },
        });
    }));
    it("not found if no game", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).get(`/api/games/0`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** POST /api/games/:id/favorite */
describe("POST /api/games/:id/favorite", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/2/favorite`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            message: "Game: 2 added to favorites",
        });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post(`/api/games/2/favorite`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("bad request if already favorite", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/1/favorite`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("not found if no game", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/0/favorite`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** POST /api/games/:id/unfavorite */
describe("POST /api/games/:id/unfavorite", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/1/unfavorite`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            message: "Game: 1 removed from favorites",
        });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post(`/api/games/1/unfavorite`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("not found if no favorite", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/2/unfavorite`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** POST /api/games/:gameId/add/:id */
describe("POST /api/games/:gameId/add/:id", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/2/add/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            message: `Game: 2 added to group: ${_testCommon_1.groupIds[0]}`,
        });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post(`/api/games/2/add/${_testCommon_1.groupIds[0]}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if not owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/2/add/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("bad request if already in group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/1/add/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(400);
    }));
    it("not found if no game", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/0/add/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/1/add/0`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
/****************************************** POST /api/games/:gameId/remove/:id */
describe("POST /api/games/:gameId/remove/:id", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/1/remove/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.body).toEqual({
            message: `Game: 1 removed from group: ${_testCommon_1.groupIds[0]}`,
        });
    }));
    it("unauth if no token", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default).post(`/api/games/1/remove/${_testCommon_1.groupIds[0]}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("unauth if not owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/1/remove/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token2}`);
        expect(resp.statusCode).toEqual(401);
    }));
    it("not found if not in group", () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/games/0/remove/${_testCommon_1.groupIds[0]}`)
            .set("authorization", `Bearer ${_testCommon_1.token1}`);
        expect(resp.statusCode).toEqual(404);
    }));
});
//# sourceMappingURL=games.test.js.map