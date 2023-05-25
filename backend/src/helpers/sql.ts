import { BadRequestError } from "./expressError";
import type { UserUpdate } from "../types";

const jsToSql = {
  avatarUrl: "avatar_url",
  triviaScore: "trivia_score",
  startTime: "start_time",
  endTime: "end_time",
};

function sqlForPartialUpdate(dataToUpdate: UserUpdate) {
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

export default sqlForPartialUpdate;
