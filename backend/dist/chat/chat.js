"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatuser_1 = __importDefault(require("./chatuser"));
const router = express_1.default.Router();
router.ws("/:id", (ws, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new chatuser_1.default(ws.send.bind(ws), +req.params.id);
        ws.on("message", (message) => {
            try {
                user.handleMessage(message);
            }
            catch (error) {
                console.error(error);
            }
        });
        ws.on("close", () => {
            try {
                user.handleClose();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    catch (error) {
        console.error(error);
    }
}));
exports.default = router;
//# sourceMappingURL=chat.js.map