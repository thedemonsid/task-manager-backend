"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
class TaskModel {
    constructor(task) {
        this.task = task;
    }
    // Getters
    get id() {
        return this.task.id;
    }
    get title() {
        return this.task.title;
    }
    get status() {
        return this.task.status;
    }
    get priority() {
        return this.task.priority;
    }
    get startTime() {
        return this.task.startTime;
    }
    get endTime() {
        return this.task.endTime;
    }
    calculateTimeToFinish() {
        return ((this.task.endTime.getTime() - this.task.startTime.getTime()) /
            (1000 * 60 * 60));
    }
    calculateTimeLapsed(currentTime = new Date()) {
        if (currentTime < this.task.startTime)
            return 0;
        return ((currentTime.getTime() - this.task.startTime.getTime()) / (1000 * 60 * 60));
    }
    calculateRemainingTime(currentTime = new Date()) {
        if (currentTime > this.task.endTime)
            return 0;
        return ((this.task.endTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60));
    }
    toJSON() {
        return {
            id: this.task.id,
            title: this.task.title,
            description: this.task.description,
            status: this.task.status,
            priority: this.task.priority,
            startTime: this.task.startTime,
            endTime: this.task.endTime,
            userId: this.task.userId,
        };
    }
}
exports.TaskModel = TaskModel;
