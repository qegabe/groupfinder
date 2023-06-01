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
import { IUser } from "../types";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************************************** GET /api/users */
describe("GET /api/users", () => {
  it("works", async () => {
    const resp = await request(app).get("/api/users");

    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          avatarUrl: null,
        },
        {
          username: "u2",
          avatarUrl: null,
        },
        {
          username: "u3",
          avatarUrl: null,
        },
      ],
    });
  });
});

/****************************************** GET /api/users/:username */
describe("GET /api/users/:username", () => {
  it("works", async () => {
    const resp = await request(app).get(`/api/users/u1`);

    expect(resp.body).toEqual({
      user: {
        username: "u1",
        bio: "",
        avatarUrl: null,
        triviaScore: null,
      },
    });
  });

  it("not found if no user", async () => {
    const resp = await request(app).get(`/api/users/wrong`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** PATCH /api/users/:username */
describe("PATCH /api/users/:username", () => {
  it("works", async () => {
    const data: IUser = {
      bio: "test",
      avatarUrl: "http://www.img.com/test.jpg",
    };

    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send(data)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      user: {
        username: "u1",
        bio: "test",
        avatarUrl: "http://www.img.com/test.jpg",
      },
    });
  });

  it("bad request with invalid data", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({ avatarUrl: "not a url" })
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("bad request with missing data", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({})
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("unauth if no token", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({ bio: "test" });

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if wrong user", async () => {
    const resp = await request(app)
      .patch(`/api/users/u1`)
      .send({ bio: "test" })
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });
});

/****************************************** DELETE /api/users/:username */
describe("DELETE /api/users/:username", () => {
  it("works", async () => {
    const resp = await request(app)
      .delete(`/api/users/u1`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({ message: "User u1 removed" });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).delete(`/api/users/u1`);

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if wrong user", async () => {
    const resp = await request(app)
      .delete(`/api/users/u1`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });
});
