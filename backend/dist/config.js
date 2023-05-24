"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BCRYPT_WORK_FACTOR = exports.getDatabaseUri = exports.PORT = exports.SECRET_KEY = void 0;
require("dotenv/config");
const SECRET_KEY = process.env.SECRET_KEY || "secret";
exports.SECRET_KEY = SECRET_KEY;
const PORT = +process.env.PORT || 5000;
exports.PORT = PORT;
function getDatabaseUri() {
    if (process.env.NODE_ENV === "test") {
        return "groupfinder_test";
    }
    else {
        return process.env.DATABASE_URL || "groupfinder";
    }
}
exports.getDatabaseUri = getDatabaseUri;
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;
exports.BCRYPT_WORK_FACTOR = BCRYPT_WORK_FACTOR;
//# sourceMappingURL=config.js.map