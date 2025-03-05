import { Request, Response } from "express";
import { TaskService } from "../services/TaskService";
import * as z from "zod";
import { Priority } from "@prisma/client";

const TaskCreateSchema = z
  .object({
    title: z
      .string({
        required_error: "Task title is required",
        invalid_type_error: "Task title must be a string",
      })
      .min(2, "Task title must be at least 2 characters long"),

    description: z
      .string({
        invalid_type_error: "Description must be a string",
      })
      .optional(),

    startTime: z
      .string({
        required_error: "Start time is required",
        invalid_type_error: "Start time must be a valid date string",
      })
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "Start time must be a valid date format",
      }),

    endTime: z
      .string({
        required_error: "End time is required",
        invalid_type_error: "End time must be a valid date string",
      })
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "End time must be a valid date format",
      }),

    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"], {
      required_error: "Priority is required",
      invalid_type_error:
        "Priority must be one of: LOW, MEDIUM, HIGH, URGENT, CRITICAL",
    }),
  })
  .refine(
    (data) => {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      return endTime > startTime;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

const TaskUpdateSchema = z.object({
  title: z
    .string({
      invalid_type_error: "Task title must be a string",
    })
    .min(2, "Task title must be at least 2 characters long")
    .optional(),

  description: z
    .string({
      invalid_type_error: "Description must be a string",
    })
    .optional(),

  startTime: z
    .string({
      invalid_type_error: "Start time must be a valid date string",
    })
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Start time must be a valid date format",
    })
    .optional(),

  endTime: z
    .string({
      invalid_type_error: "End time must be a valid date string",
    })
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "End time must be a valid date format",
    })
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"], {
      invalid_type_error:
        "Priority must be one of: LOW, MEDIUM, HIGH, URGENT, CRITICAL",
    })
    .optional(),

  status: z
    .enum(["PENDING", "FINISHED"], {
      invalid_type_error: "Status must be either PENDING or FINISHED",
    })
    .optional(),
});

const TaskQuerySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]).optional(),
  status: z.enum(["PENDING", "FINISHED"]).optional(),
  sortBy: z.enum(["startTime", "endTime"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async createTask(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Validate input using Zod
      const validationResult = TaskCreateSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = validationResult.error.format();
        return res.status(400).json({
          error: "Validation failed",
          details: formattedErrors,
        });
      }

      const { title, description, startTime, endTime, priority } =
        validationResult.data;

      const task = await this.taskService.createTask({
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        priority: priority as Priority,
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

      const validationResult = TaskQuerySchema.safeParse(req.query);

      if (!validationResult.success) {
        const formattedErrors = validationResult.error.format();
        return res.status(400).json({
          error: "Invalid query parameters",
          details: formattedErrors,
        });
      }

      const { priority, status, sortBy, sortDir } = validationResult.data;

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

      const validationResult = TaskUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = validationResult.error.format();
        return res.status(400).json({
          error: "Validation failed",
          details: formattedErrors,
        });
      }

      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (task.toJSON().userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      if (validationResult.data.startTime && validationResult.data.endTime) {
        const startTime = new Date(validationResult.data.startTime);
        const endTime = new Date(validationResult.data.endTime);

        if (endTime <= startTime) {
          return res.status(400).json({
            error: "Validation failed",
            details: { endTime: ["End time must be after start time"] },
          });
        }
      }

      const updateData: any = { ...validationResult.data };
      if (updateData.startTime)
        updateData.startTime = new Date(updateData.startTime);
      if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);

      const updatedTask = await this.taskService.updateTask(id, updateData);
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

      //* Checking if the task trully belongs to the user
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
