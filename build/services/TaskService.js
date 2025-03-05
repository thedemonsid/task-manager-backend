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
exports.TaskService = void 0;
const client_1 = require("@prisma/client");
const Task_model_1 = require("../models/Task.model");
const prisma_1 = require("../utils/prisma");
class TaskService {
    createTask(taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield prisma_1.prisma.task.create({
                data: taskData,
            });
            return new Task_model_1.TaskModel(task);
        });
    }
    getTaskById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield prisma_1.prisma.task.findUnique({ where: { id } });
            return task ? new Task_model_1.TaskModel(task) : null;
        });
    }
    getUserTasks(userId, filters, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = Object.assign({ userId }, filters);
            const orderBy = sort ? { [sort.field]: sort.direction } : undefined;
            const tasks = yield prisma_1.prisma.task.findMany({
                where,
                orderBy,
            });
            return tasks.map((task) => new Task_model_1.TaskModel(task));
        });
    }
    updateTask(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield prisma_1.prisma.task.update({
                where: { id },
                data,
            });
            return new Task_model_1.TaskModel(task);
        });
    }
    markTaskAsComplete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield prisma_1.prisma.task.update({
                where: { id },
                data: {
                    status: client_1.TaskStatus.FINISHED,
                    endTime: new Date(), //* Update endTime to current time as per requirement mentioned in the task
                },
            });
            return new Task_model_1.TaskModel(task);
        });
    }
    deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.prisma.task.delete({ where: { id } });
        });
    }
}
exports.TaskService = TaskService;
