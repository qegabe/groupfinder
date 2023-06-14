import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  groupIds,
} from "./_testCommon";
import Group from "./group";
import db from "../db";
import { BadRequestError, NotFoundError } from "../helpers/expressError";
import { IGroup } from "../types";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********************************************** create */
describe("create", () => {
  it("works: minimum data", async () => {
    const group = await Group.create("u1", {
      title: "test",
      startTime: new Date(),
      endTime: new Date(),
    });

    expect(group).toEqual({
      id: expect.any(Number),
      title: "test",
      description: "",
      startTime: expect.any(Date),
      endTime: expect.any(Date),
      location: null,
      isPrivate: false,
      maxMembers: null,
    });
  });

  it("works: all data", async () => {
    const group = await Group.create("u1", {
      title: "test",
      description: "desc",
      startTime: new Date(),
      endTime: new Date(),
      location: "place",
      isPrivate: true,
      maxMembers: 10,
    });

    expect(group).toEqual({
      id: expect.any(Number),
      title: "test",
      description: "desc",
      startTime: expect.any(Date),
      endTime: expect.any(Date),
      location: "place",
      isPrivate: true,
      maxMembers: 10,
    });
  });
});

/********************************************** getList */
describe("getList", () => {
  it("works: no filter", async () => {
    const groups = await Group.getList();

    expect(groups).toEqual([
      {
        id: expect.any(Number),
        title: "g1",
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      },
      {
        id: expect.any(Number),
        title: "g2",
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      },
      {
        id: expect.any(Number),
        title: "g3",
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      },
    ]);
  });

  it("works: filtered", async () => {
    const groups = await Group.getList(100, { title: "g", maxSize: 1 });

    expect(groups).toEqual([
      {
        id: expect.any(Number),
        title: "g2",
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      },
      {
        id: expect.any(Number),
        title: "g3",
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      },
    ]);
  });
});

/********************************************** getById */
describe("getById", () => {
  it("works", async () => {
    const group = await Group.getById(groupIds[0]);

    expect(group).toEqual({
      id: groupIds[0],
      title: "g1",
      description: "",
      startTime: expect.any(Date),
      endTime: expect.any(Date),
      location: null,
      isPrivate: false,
      maxMembers: null,
      members: {
        u1: { isOwner: true, avatarUrl: null },
        u2: { isOwner: false, avatarUrl: null },
      },
      games: [{ id: 1, title: "game1", coverUrl: "" }],
    });
  });

  it("not found if no group", async () => {
    try {
      await Group.getById(0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});

/********************************************** update */
describe("update", () => {
  it("works", async () => {
    const date = new Date();
    const updateData: IGroup = {
      title: "new",
      description: "test",
      startTime: date,
      endTime: date,
      location: "place",
      isPrivate: true,
      maxMembers: 10,
    };

    const group = await Group.update(groupIds[0], updateData);

    expect(group).toEqual({
      id: groupIds[0],
      title: "new",
      description: "test",
      startTime: date,
      endTime: date,
      location: "place",
      isPrivate: true,
      maxMembers: 10,
    });
  });

  it("bad request if setting max members below current member count", async () => {
    try {
      await Group.update(groupIds[0], { maxMembers: 1 });
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });

  it("not found if no group", async () => {
    try {
      await Group.update(0, { title: "test" });
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});

/********************************************** remove */
describe("remove", () => {
  it("works", async () => {
    await Group.remove(groupIds[0]);

    const result = await db.query(
      `SELECT title
       FROM groups
       WHERE id = $1
      `,
      [groupIds[0]]
    );

    expect(result.rowCount).toEqual(0);
  });

  it("not found if no group", async () => {
    try {
      await Group.remove(0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});

/********************************************** isOwner */
describe("isOwner", () => {
  it("works: is owner", async () => {
    const result = await Group.isOwner(groupIds[0], "u1");

    expect(result).toBe(true);
  });

  it("works: not owner", async () => {
    const result = await Group.isOwner(groupIds[0], "u2");

    expect(result).toBe(false);
  });

  it("works: not member", async () => {
    const result = await Group.isOwner(groupIds[0], "u3");

    expect(result).toBe(false);
  });

  it("not found if no group", async () => {
    try {
      await Group.isOwner(0, "u1");
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});

/********************************************** isMember */
describe("isMember", () => {
  it("works", async () => {
    const result = await Group.isMember(groupIds[0], "u1");

    expect(result).toBe(true);
  });

  it("false if not in group", async () => {
    const result = await Group.isMember(groupIds[0], "u3");

    expect(result).toBe(false);
  });

  it("false if no group", async () => {
    const result = await Group.isMember(0, "u1");

    expect(result).toBe(false);
  });
});

/********************************************** join */
describe("join", () => {
  it("works", async () => {
    await Group.join("u3", groupIds[0]);

    const result = await db.query(
      `SELECT username
       FROM groupsusers
       WHERE group_id = $1 AND username = $2
      `,
      [groupIds[0], "u3"]
    );

    expect(result.rowCount).toEqual(1);
  });

  it("bad request if already member", async () => {
    try {
      await Group.join("u1", groupIds[0]);
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });

  it("bad request if full", async () => {
    await db.query(
      `UPDATE groups
       SET max_members = $1
       WHERE id = $2
      `,
      [2, groupIds[0]]
    );
    try {
      await Group.join("u3", groupIds[0]);
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });

  it("not found if no group", async () => {
    try {
      await Group.join("u3", 0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });

  it("not found if no user", async () => {
    try {
      await Group.join("fake", groupIds[0]);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});

/********************************************** leave */
describe("leave", () => {
  it("works", async () => {
    await Group.leave("u2", groupIds[0]);

    const result = await db.query(
      `SELECT username
       FROM groupsusers
       WHERE group_id = $1 AND username = $2
      `,
      [groupIds[0], "u2"]
    );

    expect(result.rowCount).toEqual(0);
  });

  it("bad request if owner tries to leave group", async () => {
    try {
      await Group.leave("u1", groupIds[0]);
      fail();
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });

  it("not found if no group", async () => {
    try {
      await Group.leave("u2", 0);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });

  it("not found if no user", async () => {
    try {
      await Group.join("fake", groupIds[0]);
      fail();
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});
