"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_1 = require("../services/UserService");
const z = __importStar(require("zod"));
const RegisterSchema = z.object({
    email: z
        .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    })
        .email("Please provide a valid email address"),
    password: z
        .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
    })
        .min(6, "Password must be at least 6 characters long"),
    name: z
        .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    })
        .min(2, "Name must be at least 2 characters long"),
});
const LoginSchema = z.object({
    email: z
        .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    })
        .email("Please provide a valid email address"),
    password: z
        .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
    })
        .min(6, "Password must be at least 6 characters long"),
});
class UserController {
    constructor() {
        this.userService = new UserService_1.UserService();
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validationResult = RegisterSchema.safeParse(req.body);
                if (!validationResult.success) {
                    const formattedErrors = validationResult.error.format();
                    return res.status(400).json({
                        error: "Validation failed",
                        details: formattedErrors,
                    });
                }
                const { email, password, name } = validationResult.data;
                const { user, token } = yield this.userService.register({
                    email,
                    password,
                    name,
                });
                return res.status(201).json({
                    user: user.toJSON(),
                    token,
                });
            }
            catch (error) {
                return res.status(400).json({
                    error: "Registration failed",
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validationResult = LoginSchema.safeParse(req.body);
                if (!validationResult.success) {
                    const formattedErrors = validationResult.error.format();
                    return res.status(400).json({
                        error: "Validation failed",
                        details: formattedErrors,
                    });
                }
                const { email, password } = validationResult.data;
                const { user, token } = yield this.userService.login({
                    email,
                    password,
                });
                return res.json({
                    user: user.toJSON(),
                    token,
                });
            }
            catch (error) {
                return res.status(401).json({
                    error: "Authentication failed",
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    getCurrentUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const user = yield this.userService.getUserById(userId);
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                return res.json(user.toJSON());
            }
            catch (error) {
                return res.status(500).json({
                    error: "Failed to get user profile",
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
}
exports.UserController = UserController;
