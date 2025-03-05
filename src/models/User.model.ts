import { User } from "@prisma/client";

export class UserModel {
  private user: User;

  constructor(user: User) {
    this.user = user;
  }

  // Getters
  get id(): string {
    return this.user.id;
  }
  get email(): string {
    return this.user.email;
  }
  get name(): string | null {
    return this.user.name;
  }
  
  toJSON() {
    return {
      id: this.user.id,
      email: this.user.email,
      name: this.user.name,
      createdAt: this.user.createdAt,
      updatedAt: this.user.updatedAt,
    };
  }
}
