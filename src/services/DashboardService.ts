import { PrismaClient, Priority, TaskStatus } from "@prisma/client";

export class DashboardService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUserTaskStats(userId: string) {
    const totalTasks = await this.prisma.task.count({
      where: { userId },
    });

    const completedTasks = await this.prisma.task.count({
      where: {
        userId,
        status: TaskStatus.FINISHED,
      },
    });

    //* Calculate percentages
    const pendingTasks = totalTasks - completedTasks;
    const percentCompleted =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const percentPending =
      totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;

    const pendingTasksData = await this.getPendingTasksTimeMetrics(userId);

    const averageCompletionTime = await this.getAverageCompletionTime(userId);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      percentCompleted,
      percentPending,
      pendingTasksMetrics: pendingTasksData,
      averageCompletionTime,
    };
  }

  private async getPendingTasksTimeMetrics(userId: string) {
    const now = new Date();
    const pendingTasks = await this.prisma.task.findMany({
      where: {
        userId,
        status: TaskStatus.PENDING,
      },
    });

    const metrics = {
      [Priority.LOW]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
      [Priority.MEDIUM]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
      [Priority.HIGH]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
      [Priority.URGENT]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
      [Priority.CRITICAL]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
    };

    pendingTasks.forEach((task) => {
      const priority = task.priority;
      const timeLapsed = Math.max(
        0,
        (now.getTime() - task.startTime.getTime()) / (1000 * 60 * 60)
      );
      const timeRemaining = Math.max(
        0,
        (task.endTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      metrics[priority].timeLapsed += timeLapsed;
      metrics[priority].timeRemaining += timeRemaining;
      metrics[priority].count += 1;
    });

    return metrics;
  }

  private async getAverageCompletionTime(userId: string) {
    const completedTasks = await this.prisma.task.findMany({
      where: {
        userId,
        status: TaskStatus.FINISHED,
      },
    });

    if (completedTasks.length === 0) return 0;

    const totalCompletionTime = completedTasks.reduce((sum, task) => {
      return sum + (task.endTime.getTime() - task.startTime.getTime());
    }, 0);

    return totalCompletionTime / (completedTasks.length * 1000 * 60 * 60);
  }
}
