import { Request, Response } from "express";
import { TaskService } from "../services/TaskService";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async createTask(req: Request, res: Response) {
    try {
      const userId = req.user!.id; // From auth middleware
      const { title, description, startTime, endTime, priority } = req.body;

      // Validation: endTime should be after startTime
      const startTimeDate = new Date(startTime);
      const endTimeDate = new Date(endTime);

      if (endTimeDate <= startTimeDate) {
        return res.status(400).json({
          error: "End time must be after start time",
        });
      }

      const task = await this.taskService.createTask({
        title,
        description,
        startTime: startTimeDate,
        endTime: endTimeDate,
        priority,
        userId,
      });

      return res.status(201).json(task.toJSON());
    } catch (error) {
      return res.status(500).json({
        error: "Failed to create task",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getUserTasks(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { priority, status, sortBy, sortDir } = req.query;

      const filters: any = {};
      if (priority) filters.priority = priority;
      if (status) filters.status = status;

      const sort = sortBy
        ? {
            field: sortBy as "startTime" | "endTime",
            direction: (sortDir || "asc") as "asc" | "desc",
          }
        : undefined;

      const tasks = await this.taskService.getUserTasks(userId, filters, sort);
      return res.json(tasks.map((task) => task.toJSON()));
    } catch (error) {
      return res.status(500).json({
        error: "Failed to fetch tasks",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async completeTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Ensure the task belongs to the user
      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (task.toJSON().userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updatedTask = await this.taskService.markTaskAsComplete(id);
      return res.json(updatedTask.toJSON());
    } catch (error) {
      return res.status(500).json({
        error: "Failed to complete task",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Ensure the task belongs to the user
      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (task.toJSON().userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updatedTask = await this.taskService.updateTask(id, req.body);
      return res.json(updatedTask.toJSON());
    } catch (error) {
      return res.status(500).json({
        error: "Failed to update task",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Ensure the task belongs to the user
      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (task.toJSON().userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await this.taskService.deleteTask(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        error: "Failed to delete task",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
