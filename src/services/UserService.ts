import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { UserModel } from "../models/User.model";

export class UserService {
  async register(userData: {
    email: string;
    password: string;
    name?: string;
  }): Promise<{ user: UserModel; token: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      },
    });

    const token = this.generateToken(user.id);

    return {
      user: new UserModel(user),
      token,
    };
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: UserModel; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user.id);

    return {
      user: new UserModel(user),
      token,
    };
  }

  async getUserById(id: string): Promise<UserModel | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? new UserModel(user) : null;
  }

  async updateUser(
    id: string,
    data: { name?: string; email?: string; password?: string }
  ): Promise<UserModel> {
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return new UserModel(updatedUser);
  }

  private generateToken(userId: string): string {
    const jwtSecret =
      process.env.JWT_SECRET || "default_secret_change_in_production";

    return jwt.sign({ id: userId }, jwtSecret, { expiresIn: "7d" });
  }
}
