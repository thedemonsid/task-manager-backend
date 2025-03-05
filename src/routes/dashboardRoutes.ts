import express from "express";
import { DashboardController } from "../controllers/DashboardController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const dashboardController = new DashboardController();

router.use(authMiddleware);

router.get("/stats", (req, res) => {
  dashboardController.getUserDashboardStats(req, res);
});

router.get("/priority", (req, res) => {
  dashboardController.getTasksByPriority(req, res);
});

router.get("/completion-time", (req, res) => {
  dashboardController.getCompletionTimeStats(req, res);
});

export default router;
