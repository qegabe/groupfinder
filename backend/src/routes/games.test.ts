import request from "supertest";
import app from "../app";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  groupIds,
  token1,
  token2,
  token3,
} from "./_testCommon";
import { IGame } from "../types";
import * as igdb from "../helpers/igdb";

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

/****************************************** GET /api/games */
describe("GET /api/games", () => {
  it("works", async () => {
    const resp = await request(app)
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
  });

  it("bad request with missing data", async () => {
    const resp = await request(app).get("/api/games").query({});
    expect(resp.statusCode).toEqual(400);
  });
});

/****************************************** GET /api/games/:id */
describe("GET /api/games/:id", () => {
  it("works", async () => {
    const resp = await request(app).get(`/api/games/1`);

    expect(resp.body).toEqual({
      game: {
        id: 1,
        title: "game1",
        coverUrl: "",
      },
    });
  });

  it("not found if no game", async () => {
    const resp = await request(app).get(`/api/games/0`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** POST /api/games/:id/favorite */
describe("POST /api/games/:id/favorite", () => {
  it("works", async () => {
    const resp = await request(app)
      .post(`/api/games/2/favorite`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      message: "Game: 2 added to favorites",
    });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post(`/api/games/2/favorite`);

    expect(resp.statusCode).toEqual(401);
  });

  it("bad request if already favorite", async () => {
    const resp = await request(app)
      .post(`/api/games/1/favorite`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("not found if no game", async () => {
    const resp = await request(app)
      .post(`/api/games/0/favorite`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** POST /api/games/:id/unfavorite */
describe("POST /api/games/:id/unfavorite", () => {
  it("works", async () => {
    const resp = await request(app)
      .post(`/api/games/1/unfavorite`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      message: "Game: 1 removed from favorites",
    });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post(`/api/games/1/unfavorite`);

    expect(resp.statusCode).toEqual(401);
  });

  it("not found if no favorite", async () => {
    const resp = await request(app)
      .post(`/api/games/2/unfavorite`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** POST /api/games/:gameId/add/:id */
describe("POST /api/games/:gameId/add/:id", () => {
  it("works", async () => {
    const resp = await request(app)
      .post(`/api/games/2/add/${groupIds[0]}`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      message: `Game: 2 added to group: ${groupIds[0]}`,
    });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post(`/api/games/2/add/${groupIds[0]}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if not owner", async () => {
    const resp = await request(app)
      .post(`/api/games/2/add/${groupIds[0]}`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("bad request if already in group", async () => {
    const resp = await request(app)
      .post(`/api/games/1/add/${groupIds[0]}`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("not found if no game", async () => {
    const resp = await request(app)
      .post(`/api/games/0/add/${groupIds[0]}`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });

  it("not found if no group", async () => {
    const resp = await request(app)
      .post(`/api/games/1/add/0`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** POST /api/games/:gameId/remove/:id */
describe("POST /api/games/:gameId/remove/:id", () => {
  it("works", async () => {
    const resp = await request(app)
      .post(`/api/games/1/remove/${groupIds[0]}`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      message: `Game: 1 removed from group: ${groupIds[0]}`,
    });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post(`/api/games/1/remove/${groupIds[0]}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if not owner", async () => {
    const resp = await request(app)
      .post(`/api/games/1/remove/${groupIds[0]}`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("not found if not in group", async () => {
    const resp = await request(app)
      .post(`/api/games/0/remove/${groupIds[0]}`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});
