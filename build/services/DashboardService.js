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
exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
class DashboardService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    getUserTaskStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalTasks = yield this.prisma.task.count({
                where: { userId },
            });
            const completedTasks = yield this.prisma.task.count({
                where: {
                    userId,
                    status: client_1.TaskStatus.FINISHED,
                },
            });
            //* Calculate percentages
            const pendingTasks = totalTasks - completedTasks;
            const percentCompleted = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const percentPending = totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;
            const pendingTasksData = yield this.getPendingTasksTimeMetrics(userId);
            const averageCompletionTime = yield this.getAverageCompletionTime(userId);
            return {
                totalTasks,
                completedTasks,
                pendingTasks,
                percentCompleted,
                percentPending,
                pendingTasksMetrics: pendingTasksData,
                averageCompletionTime,
            };
        });
    }
    getPendingTasksTimeMetrics(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const pendingTasks = yield this.prisma.task.findMany({
                where: {
                    userId,
                    status: client_1.TaskStatus.PENDING,
                },
            });
            const metrics = {
                [client_1.Priority.LOW]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
                [client_1.Priority.MEDIUM]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
                [client_1.Priority.HIGH]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
                [client_1.Priority.URGENT]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
                [client_1.Priority.CRITICAL]: { timeLapsed: 0, timeRemaining: 0, count: 0 },
            };
            pendingTasks.forEach((task) => {
                const priority = task.priority;
                const timeLapsed = Math.max(0, (now.getTime() - task.startTime.getTime()) / (1000 * 60 * 60));
                const timeRemaining = Math.max(0, (task.endTime.getTime() - now.getTime()) / (1000 * 60 * 60));
                metrics[priority].timeLapsed += timeLapsed;
                metrics[priority].timeRemaining += timeRemaining;
                metrics[priority].count += 1;
            });
            return metrics;
        });
    }
    getAverageCompletionTime(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const completedTasks = yield this.prisma.task.findMany({
                where: {
                    userId,
                    status: client_1.TaskStatus.FINISHED,
                },
            });
            if (completedTasks.length === 0)
                return 0;
            const totalCompletionTime = completedTasks.reduce((sum, task) => {
                return sum + (task.endTime.getTime() - task.startTime.getTime());
            }, 0);
            return totalCompletionTime / (completedTasks.length * 1000 * 60 * 60);
        });
    }
}
exports.DashboardService = DashboardService;
