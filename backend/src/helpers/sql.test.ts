import { sqlForFiltering, sqlForInserting, sqlForPartialUpdate } from "./sql";
import { Filter } from "../types";

describe("sql helpers", () => {
  it("sqlForFiltering", () => {
    const filter: Filter = {
      title: "test",
      startTimeAfter: "test2",
      startTimeBefore: "test3",
      maxSize: "5",
    };

    const { matchers, values } = sqlForFiltering(filter);

    expect(matchers).toEqual([
      "title ILIKE $1",
      "start_time >= $2",
      "start_time <= $3",
      `id IN (SELECT id
                FROM groups
                LEFT JOIN groupsusers ON groupsusers.group_id = groups.id
                GROUP BY id
                HAVING COUNT(*) <= $4
              )`,
    ]);
    expect(values).toEqual(["%test%", "test2", "test3", "5"]);
  });

  it("sqlForInserting", () => {
    const data = {
      title: "test",
      isPrivate: true,
    };

    const { colString, valString, values } = sqlForInserting(data);

    expect(colString).toEqual("(title, is_private)");
    expect(valString).toEqual("($1, $2)");
    expect(values).toEqual(["test", true]);
  });

  it("sqlForPartialUpdate", () => {
    const data = {
      username: "Bob",
      avatarUrl: "test",
    };
    const { setCols, values } = sqlForPartialUpdate(data);
    expect(setCols).toEqual('"username"=$1, "avatar_url"=$2');
    expect(values).toEqual(["Bob", "test"]);
  });
});
