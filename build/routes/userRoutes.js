"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const userController = new UserController_1.UserController();
//* Public routes
router.post("/register", (req, res) => {
    userController.register(req, res);
});
router.post("/login", (req, res) => {
    userController.login(req, res);
});
//* Protected routes
router.get("/me", auth_middleware_1.authMiddleware, (req, res) => {
    userController.getCurrentUser(req, res);
});
// router.put("/me", authMiddleware, (req, res) => {
//   userController.updateProfile(req, res);
// });
exports.default = router;
