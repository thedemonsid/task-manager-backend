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
exports.TaskController = void 0;
const TaskService_1 = require("../services/TaskService");
const z = __importStar(require("zod"));
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
        invalid_type_error: "Priority must be one of: LOW, MEDIUM, HIGH, URGENT, CRITICAL",
    }),
})
    .refine((data) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    return endTime > startTime;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});
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
        invalid_type_error: "Priority must be one of: LOW, MEDIUM, HIGH, URGENT, CRITICAL",
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
class TaskController {
    constructor() {
        this.taskService = new TaskService_1.TaskService();
    }
    createTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                // Validate input using Zod
                const validationResult = TaskCreateSchema.safeParse(req.body);
                if (!validationResult.success) {
                    const formattedErrors = validationResult.error.format();
                    return res.status(400).json({
                        error: "Validation failed",
                        details: formattedErrors,
                    });
                }
                const { title, description, startTime, endTime, priority } = validationResult.data;
                const task = yield this.taskService.createTask({
                    title,
                    description,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    priority: priority,
                    userId,
                });
                return res.status(201).json(task.toJSON());
            }
            catch (error) {
                return res.status(500).json({
                    error: "Failed to create task",
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    getUserTasks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const validationResult = TaskQuerySchema.safeParse(req.query);
                if (!validationResult.success) {
                    const formattedErrors = validationResult.error.format();
                    return res.status(400).json({
                        error: "Invalid query parameters",
                        details: formattedErrors,
                    });
                }
                const { priority, status, sortBy, sortDir } = validationResult.data;
                const filters = {};
                if (priority)
                    filters.priority = priority;
                if (status)
                    filters.status = status;
                const sort = sortBy
                    ? {
                        field: sortBy,
                        direction: (sortDir || "asc"),
                    }
                    : undefined;
                const tasks = yield this.taskService.getUserTasks(userId, filters, sort);
                return res.json(tasks.map((task) => task.toJSON()));
            }
            catch (error) {
                return res.status(500).json({
                    error: "Failed to fetch tasks",
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    // async completeTask(req: Request, res: Response) {
    //   try {
    //     const { id } = req.params;
    //     const userId = req.user!.id;
    //     const task = await this.taskService.getTaskById(id);
    //     if (!task) {
    //       return res.status(404).json({ error: "Task not found" });
    //     }
    //     if (task.toJSON().userId !== userId) {
    //       return res.status(403).json({ error: "Not authorized" });
    //     }
    //     const updatedTask = await this.taskService.markTaskAsComplete(id);
    //     return res.json(updatedTask.toJSON());
    //   } catch (error) {
    //     return res.status(500).json({
    //       error: "Failed to complete task",
    //       details: error instanceof Error ? error.message : String(error),
    //     });
    //   }
    // }
    updateTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = req.user.id;
                const validationResult = TaskUpdateSchema.safeParse(req.body);
                if (!validationResult.success) {
                    const formattedErrors = validationResult.error.format();
                    return res.status(400).json({
                        error: "Validation failed",
                        details: formattedErrors,
                    });
                }
                const task = yield this.taskService.getTaskById(id);
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
                const updateData = Object.assign({}, validationResult.data);
                if (updateData.startTime)
                    updateData.startTime = new Date(updateData.startTime);
                if (updateData.endTime)
                    updateData.endTime = new Date(updateData.endTime);
                const updatedTask = yield this.taskService.updateTask(id, updateData);
                return res.json(updatedTask.toJSON());
            }
            catch (error) {
                return res.status(500).json({
                    error: "Failed to update task",
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    deleteTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = req.user.id;
                //* Checking if the task trully belongs to the user
                const task = yield this.taskService.getTaskById(id);
                if (!task) {
                    return res.status(404).json({ error: "Task not found" });
                }
                if (task.toJSON().userId !== userId) {
                    return res.status(403).json({ error: "Not authorized" });
                }
                yield this.taskService.deleteTask(id);
                return res.status(204).send();
            }
            catch (error) {
                return res.status(500).json({
                    error: "Failed to delete task",
                    details: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
}
exports.TaskController = TaskController;
