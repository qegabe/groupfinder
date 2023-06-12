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
import { IGroup } from "../types";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************************************** POST /api/groups */
describe("POST /api/groups", () => {
  it("works", async () => {
    const time = new Date();

    const data: IGroup = {
      title: "test",
      startTime: time,
      endTime: time,
    };

    const resp = await request(app)
      .post("/api/groups")
      .send(data)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      group: {
        id: expect.any(Number),
        title: "test",
        description: "",
        startTime: expect.any(String),
        endTime: expect.any(String),
        location: null,
        isPrivate: false,
        maxMembers: null,
        members: ["u1"],
      },
    });
  });

  it("bad request with invalid data", async () => {
    const resp = await request(app)
      .post("/api/groups")
      .send({
        title: 5,
        startTime: true,
        endTime: "not a time",
        notAProperty: "",
      })
      .set("authorization", `Bearer ${token1}`);
    expect(resp.statusCode).toEqual(400);
    const errs = JSON.parse(resp.body.error.message);
    expect(errs).toEqual([
      "instance.title is not of a type(s) string",
      "instance.startTime is not of a type(s) string",
      'instance.endTime does not conform to the "date-time" format',
      'instance is not allowed to have the additional property "notAProperty"',
    ]);
  });

  it("bad request with missing data", async () => {
    const resp = await request(app)
      .post("/api/groups")
      .send({})
      .set("authorization", `Bearer ${token1}`);
    expect(resp.statusCode).toEqual(400);
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post("/api/groups").send({
      title: "test",
      startTime: new Date(),
      endTime: new Date(),
    });
    expect(resp.statusCode).toEqual(401);
  });
});

/****************************************** GET /api/groups */
describe("GET /api/groups", () => {
  it("works: no filter", async () => {
    const resp = await request(app).get("/api/groups");

    expect(resp.body).toEqual({
      groups: [
        {
          id: expect.any(Number),
          title: "g1",
          startTime: expect.any(String),
          endTime: expect.any(String),
        },
        {
          id: expect.any(Number),
          title: "g3",
          startTime: expect.any(String),
          endTime: expect.any(String),
        },
      ],
    });
  });

  it("works: filter", async () => {
    const resp = await request(app).get("/api/groups").query({
      title: "g",
      startTimeAfter: "2023-05-31T09:00:00.000-04:00",
      startTimeBefore: "2023-05-31T11:00:00.000-04:00",
      maxSize: 1,
    });

    expect(resp.body).toEqual({
      groups: [
        {
          id: expect.any(Number),
          title: "g3",
          startTime: expect.any(String),
          endTime: expect.any(String),
        },
      ],
    });
  });

  it("bad request invalid data", async () => {
    const resp = await request(app).get("/api/groups").query({
      startTimeAfter: "not a time",
      maxSize: "a",
      notAProperty: "",
    });

    expect(resp.statusCode).toEqual(400);
    const errs = JSON.parse(resp.body.error.message);
    expect(errs).toEqual([
      'instance.startTimeAfter does not conform to the "date-time" format',
      'instance.maxSize does not match pattern "^[1-9][0-9]*$"',
      'instance is not allowed to have the additional property "notAProperty"',
    ]);
  });
});

/****************************************** GET /api/groups/:id */
describe("GET /api/groups/:id", () => {
  it("works", async () => {
    const resp = await request(app).get(`/api/groups/${groupIds[0]}`);

    expect(resp.body).toEqual({
      group: {
        id: groupIds[0],
        title: "g1",
        description: "",
        startTime: expect.any(String),
        endTime: expect.any(String),
        location: null,
        isPrivate: false,
        maxMembers: null,
        members: { u1: true, u2: false },
      },
    });
  });

  it("works: members in private group", async () => {
    const resp = await request(app)
      .get(`/api/groups/${groupIds[1]}`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      group: {
        id: groupIds[1],
        title: "g2",
        description: "",
        startTime: expect.any(String),
        endTime: expect.any(String),
        location: null,
        isPrivate: true,
        maxMembers: null,
        members: { u1: true },
      },
    });
  });

  it("unauth if no token and private group", async () => {
    const resp = await request(app).get(`/api/groups/${groupIds[1]}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if not in private group", async () => {
    const resp = await request(app)
      .get(`/api/groups/${groupIds[1]}`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("not found if no group", async () => {
    const resp = await request(app).get(`/api/groups/0`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** PATCH /api/groups/:id */
describe("PATCH /api/groups/:id", () => {
  it("works", async () => {
    const time = new Date("2023-05-31T08:30:00.000-04:00");
    const data: IGroup = {
      title: "new",
      description: "test",
      startTime: time,
    };

    const resp = await request(app)
      .patch(`/api/groups/${groupIds[0]}`)
      .send(data)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      group: {
        id: groupIds[0],
        title: "new",
        description: "test",
        startTime: expect.any(String),
        endTime: expect.any(String),
        location: null,
        isPrivate: false,
        maxMembers: null,
      },
    });
    const newTime = new Date(resp.body.group.startTime);
    expect(newTime.valueOf()).toEqual(time.valueOf());
  });

  it("bad request when setting max members below current member count", async () => {
    const resp = await request(app)
      .patch(`/api/groups/${groupIds[0]}`)
      .send({ maxMembers: 1 })
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("bad request with invalid data", async () => {
    const resp = await request(app)
      .patch(`/api/groups/${groupIds[0]}`)
      .send({
        title: true,
        description: {},
        startTime: "not a time",
        notAProperty: "",
      })
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
    const errs = JSON.parse(resp.body.error.message);
    expect(errs).toEqual([
      "instance.title is not of a type(s) string",
      "instance.description is not of a type(s) string",
      'instance.startTime does not conform to the "date-time" format',
      'instance is not allowed to have the additional property "notAProperty"',
    ]);
  });

  it("bad request with missing data", async () => {
    const resp = await request(app)
      .patch(`/api/groups/${groupIds[0]}`)
      .send({})
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("unauth if no token", async () => {
    const resp = await request(app)
      .patch(`/api/groups/${groupIds[1]}`)
      .send({ title: "new" });

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if not owner", async () => {
    const resp = await request(app)
      .patch(`/api/groups/${groupIds[1]}`)
      .send({ title: "new" })
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("not found if no group", async () => {
    const resp = await request(app)
      .patch(`/api/groups/0`)
      .send({ title: "new" })
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** DELETE /api/groups/:id */
describe("DELETE /api/groups/:id", () => {
  it("works", async () => {
    const resp = await request(app)
      .delete(`/api/groups/${groupIds[0]}`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      message: `Group with id: ${groupIds[0]} removed`,
    });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).delete(`/api/groups/${groupIds[0]}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if not owner", async () => {
    const resp = await request(app)
      .delete(`/api/groups/${groupIds[0]}`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("not found if no group", async () => {
    const resp = await request(app)
      .delete(`/api/groups/0`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** POST /api/groups/:id/join */
describe("POST /api/groups/:id/join", () => {
  it("works", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[1]}/join`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.body).toEqual({
      message: `User u2 joined group with id: ${groupIds[1]}`,
    });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post(`/api/groups/${groupIds[1]}/join`);

    expect(resp.statusCode).toEqual(401);
  });

  it("bad request if already member", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[0]}/join`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("bad request if full", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[2]}/join`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("not found if no group", async () => {
    const resp = await request(app)
      .post(`/api/groups/0/join`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** POST /api/groups/:id/leave */
describe("POST /api/groups/:id/leave", () => {
  it("works", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[0]}/leave`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.body).toEqual({
      message: `User u2 left group with id: ${groupIds[0]}`,
    });
  });

  it("bad request if owner tries to leave group", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[0]}/leave`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post(`/api/groups/${groupIds[0]}/leave`);

    expect(resp.statusCode).toEqual(401);
  });

  it("not found if not in group", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[1]}/leave`)
      .set("authorization", `Bearer ${token3}`);

    expect(resp.statusCode).toEqual(404);
  });

  it("not found if no group", async () => {
    const resp = await request(app)
      .post(`/api/groups/0/leave`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** POST /api/groups/:id/add/:username */
describe("POST /api/groups/:id/add/:username", () => {
  it("works", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[1]}/add/u2`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      message: `User u2 was added to group with id: ${groupIds[1]}`,
    });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post(`/api/groups/${groupIds[1]}/add/u2`);

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if not owner", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[1]}/add/u2`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("bad request if already member", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[0]}/add/u2`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("bad request if full", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[2]}/add/u2`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("not found if no group", async () => {
    const resp = await request(app)
      .post(`/api/groups/0/add/u2`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});

/****************************************** POST /api/groups/:id/remove/:username */
describe("POST /api/groups/:id/remove/:username", () => {
  it("works", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[0]}/remove/u2`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.body).toEqual({
      message: `User u2 was removed from group with id: ${groupIds[0]}`,
    });
  });

  it("unauth if no token", async () => {
    const resp = await request(app).post(
      `/api/groups/${groupIds[0]}/remove/u2`
    );

    expect(resp.statusCode).toEqual(401);
  });

  it("unauth if not owner", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[0]}/remove/u1`)
      .set("authorization", `Bearer ${token2}`);

    expect(resp.statusCode).toEqual(401);
  });

  it("bad request if remove owner", async () => {
    const resp = await request(app)
      .post(`/api/groups/${groupIds[0]}/remove/u1`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(400);
  });

  it("not found if no group", async () => {
    const resp = await request(app)
      .post(`/api/groups/0/remove/u2`)
      .set("authorization", `Bearer ${token1}`);

    expect(resp.statusCode).toEqual(404);
  });
});
