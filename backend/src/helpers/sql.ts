import { BadRequestError } from "./expressError";
import { Filter } from "../types";

const jsToSql = {
  avatarUrl: "avatar_url",
  triviaScore: "trivia_score",
  isPrivate: "is_private",
  startTime: "start_time",
  endTime: "end_time",
  maxMembers: "max_members",
};

/**
 * Creates sql for updating a row
 * @param dataToUpdate
 * @returns {object} { setCols, values }
 */
function sqlForPartialUpdate(dataToUpdate: object) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {username: 'mike', avatarUrl: 'img.jpg'} => ['"username"=$1', '"avatar_url"=$2']
  const cols = keys.map(
    (colName, idx) =>
      `"${jsToSql[colName as keyof object] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/**
 * Creates sql for filtering a SELECT query
 * @param filter
 * @returns {object} { matchers, values }
 */
function sqlForFiltering(filter: Filter) {
  const keys = Object.keys(filter);

  const matchers = [];
  const values = [];
  for (let key of keys) {
    const i = values.length + 1;
    switch (key) {
      case "title":
        matchers.push(`title ILIKE $${i}`);
        values.push(`%${filter.title}%`);
        break;
      case "startTimeAfter":
        matchers.push(`start_time >= $${i}`);
        values.push(filter.startTimeAfter);
        break;
      case "startTimeBefore":
        matchers.push(`start_time <= $${i}`);
        values.push(filter.startTimeBefore);
        break;
      case "maxSize":
        const m = `id IN (SELECT id
                FROM groups
                LEFT JOIN groupsusers ON groupsusers.group_id = groups.id
                GROUP BY id
                HAVING COUNT(*) <= $${i}
              )`;
        matchers.push(m);
        values.push(filter.maxSize);
        break;
      default:
        break;
    }
  }

  return { matchers, values };
}

/**
 * Creates sql for the columns and values of an INSERT query
 * @param data
 * @returns {object} { colString, valString, values}
 */
function sqlForInserting(data: object) {
  const keys = Object.keys(data);

  const cols: string[] = [];
  const valueIdxs: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    cols.push(jsToSql[keys[i] as keyof object] || keys[i]);
    valueIdxs.push(`$${i + 1}`);
  }

  return {
    colString: `(${cols.join(", ")})`,
    valString: `(${valueIdxs.join(", ")})`,
    values: Object.values(data),
  };
}

export { sqlForPartialUpdate, sqlForFiltering, sqlForInserting };
