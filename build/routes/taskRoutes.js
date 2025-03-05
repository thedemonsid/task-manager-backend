"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/taskRoutes.ts
const express_1 = __importDefault(require("express"));
const TaskController_1 = require("../controllers/TaskController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const taskController = new TaskController_1.TaskController();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
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
exports.default = router;
