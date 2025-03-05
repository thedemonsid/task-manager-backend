import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Basic validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const { user, token } = await this.userService.register({
        email,
        password,
        name,
      });

      return res.status(201).json({
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      return res.status(400).json({
        error: "Registration failed",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const { user, token } = await this.userService.login({
        email,
        password,
      });

      return res.json({
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      return res.status(401).json({
        error: "Authentication failed",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user!.id; // From auth middleware
      const user = await this.userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json(user.toJSON());
    } catch (error) {
      return res.status(500).json({
        error: "Failed to get user profile",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
