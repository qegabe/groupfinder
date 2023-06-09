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
const _testCommon_1 = require("./_testCommon");
const game_1 = __importDefault(require("./game"));
const igdb = __importStar(require("../helpers/igdb"));
const db_1 = __importDefault(require("../db"));
const expressError_1 = require("../helpers/expressError");
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
/********************************************** findOrAdd */
describe("findOrAdd", () => {
    it("works: already in db", () => __awaiter(void 0, void 0, void 0, function* () {
        const game = yield game_1.default.findOrAdd(1);
        expect(game).toEqual({
            id: 1,
            title: "game1",
            coverUrl: "",
        });
        expect(mockrequest.mock.calls).toHaveLength(0);
    }));
    it("works: not in db", () => __awaiter(void 0, void 0, void 0, function* () {
        const game = yield game_1.default.findOrAdd(3);
        const result = yield db_1.default.query(`SELECT id
       FROM games
       WHERE id = $1
      `, [3]);
        expect(game).toEqual({
            id: 3,
            title: "game3",
            coverUrl: "https://www.img.com/test.png",
        });
        expect(result.rowCount).toEqual(1);
        expect(mockrequest.mock.calls).toHaveLength(2);
    }));
    it("not found if not in db or igdb", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.findOrAdd(0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
            expect(mockrequest.mock.calls).toHaveLength(1);
        }
    }));
});
/********************************************** search */
describe("search", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        const games = yield game_1.default.search("game3");
        expect(games).toEqual([
            {
                id: 3,
                title: "game3",
                coverUrl: "https://www.img.com/test.png",
            },
        ]);
        expect(mockrequest.mock.calls).toHaveLength(3);
    }));
});
/********************************************** addFavorite */
describe("addFavorite", () => {
    it("works: already in db", () => __awaiter(void 0, void 0, void 0, function* () {
        yield game_1.default.addFavorite("u1", 2);
        const result = yield db_1.default.query(`SELECT username, game_id
       FROM favoritegames
       WHERE username = $1 AND game_id = $2
      `, ["u1", 2]);
        expect(result.rows[0]).toEqual({
            username: "u1",
            game_id: 2,
        });
        expect(mockrequest.mock.calls).toHaveLength(0);
    }));
    it("works: not in db", () => __awaiter(void 0, void 0, void 0, function* () {
        yield game_1.default.addFavorite("u1", 3);
        const result = yield db_1.default.query(`SELECT username, game_id
       FROM favoritegames
       WHERE username = $1 AND game_id = $2
      `, ["u1", 3]);
        expect(result.rows[0]).toEqual({
            username: "u1",
            game_id: 3,
        });
        expect(mockrequest.mock.calls).toHaveLength(2);
    }));
    it("not found if game not in db or igdb", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.addFavorite("u1", 0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
            expect(mockrequest.mock.calls).toHaveLength(1);
        }
    }));
    it("not found if no user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.addFavorite("nope", 1);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
            expect(mockrequest.mock.calls).toHaveLength(0);
        }
    }));
    it("bad request if already in favorites", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.addFavorite("u1", 1);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.BadRequestError).toBeTruthy();
            expect(mockrequest.mock.calls).toHaveLength(0);
        }
    }));
});
/********************************************** removeFavorite */
describe("removeFavorite", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        yield game_1.default.removeFavorite("u1", 1);
        const result = yield db_1.default.query(`SELECT username, game_id
       FROM favoritegames
       WHERE username = $1 AND game_id = $2
      `, ["u1", 1]);
        expect(result.rowCount).toEqual(0);
    }));
    it("not found if not favorite", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.removeFavorite("u1", 0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
/********************************************** addToGroup */
describe("addToGroup", () => {
    it("works: already in db", () => __awaiter(void 0, void 0, void 0, function* () {
        yield game_1.default.addToGroup(_testCommon_1.groupIds[0], 2);
        const result = yield db_1.default.query(`SELECT group_id, game_id
       FROM groupsgames
       WHERE group_id = $1 AND game_id = $2
      `, [_testCommon_1.groupIds[0], 2]);
        expect(result.rows[0]).toEqual({
            group_id: _testCommon_1.groupIds[0],
            game_id: 2,
        });
        expect(mockrequest.mock.calls).toHaveLength(0);
    }));
    it("works: not in db", () => __awaiter(void 0, void 0, void 0, function* () {
        yield game_1.default.addToGroup(_testCommon_1.groupIds[0], 3);
        const result = yield db_1.default.query(`SELECT group_id, game_id
       FROM groupsgames
       WHERE group_id = $1 AND game_id = $2
      `, [_testCommon_1.groupIds[0], 3]);
        expect(result.rows[0]).toEqual({
            group_id: _testCommon_1.groupIds[0],
            game_id: 3,
        });
        expect(mockrequest.mock.calls).toHaveLength(2);
    }));
    it("not found if game not in db or igdb", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.addToGroup(_testCommon_1.groupIds[0], 0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
            expect(mockrequest.mock.calls).toHaveLength(1);
        }
    }));
    it("not found if no group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.addToGroup(0, 1);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
            expect(mockrequest.mock.calls).toHaveLength(0);
        }
    }));
    it("bad request if already in group", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.addToGroup(_testCommon_1.groupIds[0], 1);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.BadRequestError).toBeTruthy();
            expect(mockrequest.mock.calls).toHaveLength(0);
        }
    }));
});
/********************************************** removeFromGroup */
describe("removeFromGroup", () => {
    it("works", () => __awaiter(void 0, void 0, void 0, function* () {
        yield game_1.default.removeFromGroup(_testCommon_1.groupIds[0], 1);
        const result = yield db_1.default.query(`SELECT group_id, game_id
       FROM groupsgames
       WHERE group_id = $1 AND game_id = $2
      `, [_testCommon_1.groupIds[0], 1]);
        expect(result.rowCount).toEqual(0);
    }));
    it("not found if not favorite", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield game_1.default.removeFromGroup(_testCommon_1.groupIds[0], 0);
            fail();
        }
        catch (error) {
            expect(error instanceof expressError_1.NotFoundError).toBeTruthy();
        }
    }));
});
//# sourceMappingURL=game.test.js.map