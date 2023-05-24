"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
let db;
if (process.env.NODE_ENV === "test") {
    db = new pg_1.Client({
        connectionString: "postgresql:///groupfinder_test",
    });
}
else {
    db = new pg_1.Client({
        connectionString: "postgresql:///groupfinder",
    });
}
db.connect();
exports.default = db;
//# sourceMappingURL=db.js.map