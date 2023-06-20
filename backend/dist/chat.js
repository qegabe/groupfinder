"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const connections = new Set();
router.ws("/chat/:id", (ws, req, next) => {
    connections.add(ws);
    ws.on("message", (message) => {
        connections.forEach((c) => c.send(message));
    });
    ws.on("close", () => {
        connections.delete(ws);
    });
});
exports.default = router;
//# sourceMappingURL=chat.js.map