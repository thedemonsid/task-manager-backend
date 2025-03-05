import { Task, Priority, TaskStatus } from "@prisma/client";

export class TaskModel {
  private task: Task;

  constructor(task: Task) {
    this.task = task;
  }

  // Getters
  get id(): string {
    return this.task.id;
  }
  get title(): string {
    return this.task.title;
  }
  get status(): TaskStatus {
    return this.task.status;
  }
  get priority(): Priority {
    return this.task.priority;
  }
  get startTime(): Date {
    return this.task.startTime;
  }
  get endTime(): Date {
    return this.task.endTime;
  }

  calculateTimeToFinish(): number {
    return (
      (this.task.endTime.getTime() - this.task.startTime.getTime()) /
      (1000 * 60 * 60)
    );
  }

  calculateTimeLapsed(currentTime: Date = new Date()): number {
    if (currentTime < this.task.startTime) return 0;

    return (
      (currentTime.getTime() - this.task.startTime.getTime()) / (1000 * 60 * 60)
    );
  }

  calculateRemainingTime(currentTime: Date = new Date()): number {
    if (currentTime > this.task.endTime) return 0;

    return (
      (this.task.endTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60)
    );
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
