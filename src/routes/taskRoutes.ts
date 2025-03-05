// src/routes/taskRoutes.ts
import express from "express";
import { TaskController } from "../controllers/TaskController";
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const taskController = new TaskController();

// All routes require authentication
router.use(authMiddleware);

// Task routes
router.post("/", async (req, res) => {
  await taskController.createTask(req, res);
});
router.get("/", async (req, res) => {
  await taskController.getUserTasks(req, res);
});
router.put("/:id", async (req, res) => {
  await taskController.updateTask(req, res);
});
router.delete("/:id", async (req, res) => {
  await taskController.deleteTask(req, res);
});
router.post("/:id/complete", async (req, res) => {
  await taskController.completeTask(req, res);
});

export default router;
