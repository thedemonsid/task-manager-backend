"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DashboardController_1 = require("../controllers/DashboardController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const dashboardController = new DashboardController_1.DashboardController();
router.use(auth_middleware_1.authMiddleware);
router.get("/stats", (req, res) => {
    dashboardController.getUserDashboardStats(req, res);
});
router.get("/priority", (req, res) => {
    dashboardController.getTasksByPriority(req, res);
});
router.get("/completion-time", (req, res) => {
    dashboardController.getCompletionTimeStats(req, res);
});
exports.default = router;
