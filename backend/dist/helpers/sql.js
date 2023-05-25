"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expressError_1 = require("./expressError");
const jsToSql = {
    avatarUrl: "avatar_url",
    triviaScore: "trivia_score",
    startTime: "start_time",
    endTime: "end_time",
};
function sqlForPartialUpdate(dataToUpdate) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0)
        throw new expressError_1.BadRequestError("No data");
    // {username: 'mike', avatarUrl: 'img.jpg'} => ['"username"=$1', '"avatar_url"=$2']
    const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);
    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    };
}
exports.default = sqlForPartialUpdate;
//# sourceMappingURL=sql.js.map