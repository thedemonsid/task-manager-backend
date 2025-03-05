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
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserService_1 = require("../services/UserService");
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers.authorization;
            if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
                res.status(401).json({ error: "No token, authorization denied" });
                return;
            }
            const token = authHeader.split(" ")[1];
            const jwtSecret = process.env.JWT_SECRET || "default_secret_change_in_production";
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.user = { id: decoded.id };
            const userService = new UserService_1.UserService();
            const user = yield userService.getUserById(decoded.id);
            if (!user) {
                res.status(401).json({ error: "User not found" });
                return;
            }
            next();
        }
        catch (error) {
            res.status(401).json({
                error: "Token is not valid",
                details: error instanceof Error ? error.message : String(error),
            });
            return;
        }
    });
}
