"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const expressError_1 = require("./helpers/expressError");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const groups_1 = __importDefault(require("./routes/groups"));
const games_1 = __importDefault(require("./routes/games"));
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("tiny"));
app.use(auth_2.authenticateJWT);
app.use("/auth", auth_1.default);
app.use("/api/users", users_1.default);
app.use("/api/groups", groups_1.default);
app.use("/api/games", games_1.default);
/** Handle 404 errors -- this matches everything */
app.use((req, res, next) => {
    return next(new expressError_1.NotFoundError());
});
/** Generic error handler; anything unhandled goes here. */
const errorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV !== "test")
        console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
    return res.status(status).json({
        error: { message, status },
    });
};
app.use(errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map