// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../services/UserService";

// Add user property to Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token, authorization denied" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret =
      process.env.JWT_SECRET || "default_secret_change_in_production";

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    // Add user info to request
    req.user = { id: decoded.id };

    // Optional: verify user exists in database
    const userService = new UserService();
    const user = await userService.getUserById(decoded.id);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({
      error: "Token is not valid",
      details: error instanceof Error ? error.message : String(error),
    });
    return;
  }
}
