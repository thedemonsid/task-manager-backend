import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import * as z from "zod";

// Input validation schemas with detailed error messages
const RegisterSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Please provide a valid email address"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, "Password must be at least 6 characters long"),
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters long"),
});

const LoginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Please provide a valid email address"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, "Password must be at least 6 characters long"),
});

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response) {
    try {
      // Validate input using Zod
      const validationResult = RegisterSchema.safeParse(req.body);

      if (!validationResult.success) {
        // Format and return validation errors
        const formattedErrors = validationResult.error.format();
        return res.status(400).json({
          error: "Validation failed",
          details: formattedErrors,
        });
      }

      const { email, password, name } = validationResult.data;

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
      // Validate input using Zod
      const validationResult = LoginSchema.safeParse(req.body);

      if (!validationResult.success) {
        // Format and return validation errors
        const formattedErrors = validationResult.error.format();
        return res.status(400).json({
          error: "Validation failed",
          details: formattedErrors,
        });
      }

      const { email, password } = validationResult.data;

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
      const userId = req.user!.id;
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
