"use strict";
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
exports.DashboardController = void 0;
const DashboardService_1 = require("../services/DashboardService");
class DashboardController {
    constructor() {
        this.dashboardService = new DashboardService_1.DashboardService();
    }
    getUserDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const dashboardStats = yield this.dashboardService.getUserTaskStats(userId);
                return res.json(Object.assign(Object.assign({}, dashboardStats), { percentCompleted: Number(dashboardStats.percentCompleted.toFixed(2)), percentPending: Number(dashboardStats.percentPending.toFixed(2)), averageCompletionTime: Number(dashboardStats.averageCompletionTime.toFixed(2)) }));
            }
            catch (error) {
                return res.status(500).json({
                    error: "Failed to fetch dashboard statistics",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }
    getTasksByPriority(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const stats = yield this.dashboardService.getUserTaskStats(userId);
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
            }
            catch (error) {
                return res.status(500).json({
                    error: "Failed to fetch priority statistics",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }
    getCompletionTimeStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const stats = yield this.dashboardService.getUserTaskStats(userId);
                return res.json({
                    averageCompletionTimeHours: Number(stats.averageCompletionTime.toFixed(2)),
                    completedTaskCount: stats.completedTasks,
                    pendingTaskCount: stats.pendingTasks,
                    averageCompletionTimeMinutes: Number((stats.averageCompletionTime * 60).toFixed(2)),
                    averageCompletionTimeDays: Number((stats.averageCompletionTime / 24).toFixed(2))
                });
            }
            catch (error) {
                return res.status(500).json({
                    error: "Failed to fetch completion time statistics",
                    details: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }
}
exports.DashboardController = DashboardController;
