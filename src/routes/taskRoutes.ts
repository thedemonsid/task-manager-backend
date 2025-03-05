// src/routes/taskRoutes.ts
import express from "express";
import { TaskController } from "../controllers/TaskController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const taskController = new TaskController();

// All routes require authentication
router.use(authMiddleware);

router.post("/", (req, res) => {
  taskController.createTask(req, res);
});
router.get("/", (req, res) => {
  taskController.getUserTasks(req, res);
});
router.put("/:id", (req, res) => {
  taskController.updateTask(req, res);
});
router.delete("/:id", (req, res) => {
  taskController.deleteTask(req, res);
});
// router.post("/:id/complete", (req, res) => {
//   taskController.completeTask(req, res);
// });

export default router;
