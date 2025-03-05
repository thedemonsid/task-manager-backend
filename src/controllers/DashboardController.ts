import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async getUserDashboardStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id; 
      
      const dashboardStats = await this.dashboardService.getUserTaskStats(userId);
      
      return res.json({
        ...dashboardStats,
        
        percentCompleted: Number(dashboardStats.percentCompleted.toFixed(2)),
        percentPending: Number(dashboardStats.percentPending.toFixed(2)),
        averageCompletionTime: Number(dashboardStats.averageCompletionTime.toFixed(2))
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to fetch dashboard statistics",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

 
  async getTasksByPriority(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      
     
      const stats = await this.dashboardService.getUserTaskStats(userId);
      
      const priorityStats = Object.entries(stats.pendingTasksMetrics).map(([priority, metrics]) => {
        return {
          priority,
          pendingCount: metrics.count,
          averageTimeLapsed: metrics.count > 0 ? Number((metrics.timeLapsed / metrics.count).toFixed(2)) : 0,
          averageTimeRemaining: metrics.count > 0 ? Number((metrics.timeRemaining / metrics.count).toFixed(2)) : 0,
          totalTimeLapsed: Number(metrics.timeLapsed.toFixed(2)),
          totalTimeRemaining: Number(metrics.timeRemaining.toFixed(2))
        };
      });
      
      return res.json({
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        pendingTasks: stats.pendingTasks,
        priorityStats
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to fetch priority statistics",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }


  async getCompletionTimeStats(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      
      const stats = await this.dashboardService.getUserTaskStats(userId);
      
      return res.json({
        averageCompletionTimeHours: Number(stats.averageCompletionTime.toFixed(2)),
        completedTaskCount: stats.completedTasks,
        pendingTaskCount: stats.pendingTasks,
       
        averageCompletionTimeMinutes: Number((stats.averageCompletionTime * 60).toFixed(2)),
        averageCompletionTimeDays: Number((stats.averageCompletionTime / 24).toFixed(2))
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to fetch completion time statistics",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
}