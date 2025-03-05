import { Task, Priority, TaskStatus } from "@prisma/client";
import { TaskModel } from "../models/Task.model";
import { prisma } from "../utils/prisma";
export class TaskService {
  async createTask(taskData: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    priority: Priority;
    userId: string;
  }): Promise<TaskModel> {
    const task = await prisma.task.create({
      data: taskData,
    });
    return new TaskModel(task);
  }

  async getTaskById(id: string): Promise<TaskModel | null> {
    const task = await prisma.task.findUnique({ where: { id } });
    return task ? new TaskModel(task) : null;
  }

  async getUserTasks(
    userId: string,
    filters?: {
      priority?: Priority;
      status?: TaskStatus;
    },
    sort?: {
      field: "startTime" | "endTime";
      direction: "asc" | "desc";
    }
  ): Promise<TaskModel[]> {
    const where = {
      userId,
      ...filters,
    };

    const orderBy = sort ? { [sort.field]: sort.direction } : undefined;

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
    });

    return tasks.map((task) => new TaskModel(task));
  }

  async updateTask(id: string, data: Partial<Task>): Promise<TaskModel> {
    const task = await prisma.task.update({
      where: { id },
      data,
    });
    return new TaskModel(task);
  }

  async markTaskAsComplete(id: string): Promise<TaskModel> {
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.FINISHED,
        endTime: new Date(), //* Update endTime to current time as per requirement mentioned in the task
      },
    });
    return new TaskModel(task);
  }

  async deleteTask(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }
}
