import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  groupIds,
} from "./_testCommon";
import Game from "./game";
import * as igdb from "../helpers/igdb";
import db from "../db";
import { BadRequestError, NotFoundError } from "../helpers/expressError";
import { IGame } from "../types";

const mockrequest = jest
  .spyOn(igdb, "requestIGDB")
  .mockImplementation(async (endpoint, data) => {
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
  });

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(async () => {
  await commonAfterEach();
  mockrequest.mockClear();
});
afterAll(commonAfterAll);

/********************************************** findOrAdd */
describe("findOrAdd", () => {
  it("works: already in db", async () => {
    const game = await Game.findOrAdd(1);

    expect(game).toEqual({
      id: 1,
      title: "game1",
      coverUrl: "",
    });
    expect(mockrequest.mock.calls).toHaveLength(0);
  });

  it("works: not in db", async () => {
    const game = await Game.findOrAdd(3);

    const result = await db.query(
      `SELECT id
       FROM games
       WHERE id = $1
      `,
      [3]
    );

    expect(game).toEqual({
      id: 3,
      title: "game3",
      coverUrl: "https://www.img.com/test.png",
    });
    expect(result.rowCount).toEqual(1);
    expect(mockrequest.mock.calls).toHaveLength(2);
  });

  it("not found if not in db or igdb", async () => {
    try {
      await Game.findOrAdd(0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(mockrequest.mock.calls).toHaveLength(1);
    }
  });
});

/********************************************** search */
describe("search", () => {
  it("works", async () => {
    const games = await Game.search("game3");

    expect(games).toEqual([
      {
        id: 3,
        title: "game3",
        coverUrl: "https://www.img.com/test.png",
      },
    ]);
    expect(mockrequest.mock.calls).toHaveLength(3);
  });
});

/********************************************** addFavorite */
describe("addFavorite", () => {
  it("works: already in db", async () => {
    await Game.addFavorite("u1", 2);

    const result = await db.query(
      `SELECT username, game_id
       FROM favoritegames
       WHERE username = $1 AND game_id = $2
      `,
      ["u1", 2]
    );
    expect(result.rows[0]).toEqual({
      username: "u1",
      game_id: 2,
    });
    expect(mockrequest.mock.calls).toHaveLength(0);
  });

  it("works: not in db", async () => {
    await Game.addFavorite("u1", 3);

    const result = await db.query(
      `SELECT username, game_id
       FROM favoritegames
       WHERE username = $1 AND game_id = $2
      `,
      ["u1", 3]
    );
    expect(result.rows[0]).toEqual({
      username: "u1",
      game_id: 3,
    });
    expect(mockrequest.mock.calls).toHaveLength(2);
  });

  it("not found if game not in db or igdb", async () => {
    try {
      await Game.addFavorite("u1", 0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(mockrequest.mock.calls).toHaveLength(1);
    }
  });

  it("not found if no user", async () => {
    try {
      await Game.addFavorite("nope", 1);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(mockrequest.mock.calls).toHaveLength(0);
    }
  });

  it("bad request if already in favorites", async () => {
    try {
      await Game.addFavorite("u1", 1);
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
      expect(mockrequest.mock.calls).toHaveLength(0);
    }
  });
});

/********************************************** removeFavorite */
describe("removeFavorite", () => {
  it("works", async () => {
    await Game.removeFavorite("u1", 1);

    const result = await db.query(
      `SELECT username, game_id
       FROM favoritegames
       WHERE username = $1 AND game_id = $2
      `,
      ["u1", 1]
    );
    expect(result.rowCount).toEqual(0);
  });

  it("not found if not favorite", async () => {
    try {
      await Game.removeFavorite("u1", 0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});

/********************************************** addToGroup */
describe("addToGroup", () => {
  it("works: already in db", async () => {
    await Game.addToGroup(groupIds[0], 2);

    const result = await db.query(
      `SELECT group_id, game_id
       FROM groupsgames
       WHERE group_id = $1 AND game_id = $2
      `,
      [groupIds[0], 2]
    );
    expect(result.rows[0]).toEqual({
      group_id: groupIds[0],
      game_id: 2,
    });
    expect(mockrequest.mock.calls).toHaveLength(0);
  });

  it("works: not in db", async () => {
    await Game.addToGroup(groupIds[0], 3);

    const result = await db.query(
      `SELECT group_id, game_id
       FROM groupsgames
       WHERE group_id = $1 AND game_id = $2
      `,
      [groupIds[0], 3]
    );
    expect(result.rows[0]).toEqual({
      group_id: groupIds[0],
      game_id: 3,
    });
    expect(mockrequest.mock.calls).toHaveLength(2);
  });

  it("not found if game not in db or igdb", async () => {
    try {
      await Game.addToGroup(groupIds[0], 0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(mockrequest.mock.calls).toHaveLength(1);
    }
  });

  it("not found if no group", async () => {
    try {
      await Game.addToGroup(0, 1);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
      expect(mockrequest.mock.calls).toHaveLength(0);
    }
  });

  it("bad request if already in group", async () => {
    try {
      await Game.addToGroup(groupIds[0], 1);
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
      expect(mockrequest.mock.calls).toHaveLength(0);
    }
  });
});

/********************************************** removeFromGroup */
describe("removeFromGroup", () => {
  it("works", async () => {
    await Game.removeFromGroup(groupIds[0], 1);

    const result = await db.query(
      `SELECT group_id, game_id
       FROM groupsgames
       WHERE group_id = $1 AND game_id = $2
      `,
      [groupIds[0], 1]
    );
    expect(result.rowCount).toEqual(0);
  });

  it("not found if not favorite", async () => {
    try {
      await Game.removeFromGroup(groupIds[0], 0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});
