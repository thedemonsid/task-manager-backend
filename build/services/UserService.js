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
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const User_model_1 = require("../models/User.model");
class UserService {
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield prisma_1.prisma.user.findUnique({
                where: { email: userData.email },
            });
            if (existingUser) {
                throw new Error("User with this email already exists");
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(userData.password, salt);
            const user = yield prisma_1.prisma.user.create({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                },
            });
            const token = this.generateToken(user.id);
            return {
                user: new User_model_1.UserModel(user),
                token,
            };
        });
    }
    login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findUnique({
                where: { email: credentials.email },
            });
            if (!user) {
                throw new Error("Invalid credentials");
            }
            const isMatch = yield bcryptjs_1.default.compare(credentials.password, user.password);
            if (!isMatch) {
                throw new Error("Invalid credentials");
            }
            const token = this.generateToken(user.id);
            return {
                user: new User_model_1.UserModel(user),
                token,
            };
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findUnique({
                where: { id },
            });
            return user ? new User_model_1.UserModel(user) : null;
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.password) {
                const salt = yield bcryptjs_1.default.genSalt(10);
                data.password = yield bcryptjs_1.default.hash(data.password, salt);
            }
            const updatedUser = yield prisma_1.prisma.user.update({
                where: { id },
                data,
            });
            return new User_model_1.UserModel(updatedUser);
        });
    }
    generateToken(userId) {
        const jwtSecret = process.env.JWT_SECRET || "default_secret_change_in_production";
        return jsonwebtoken_1.default.sign({ id: userId }, jwtSecret, { expiresIn: "7d" });
    }
}
exports.UserService = UserService;
