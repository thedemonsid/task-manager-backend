import express from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const userController = new UserController();

// Public routes
router.post("/register", (req, res) => {
  userController.register(req, res);
});
router.post("/login", (req, res) => {
  userController.login(req, res);
});

// Protected routes
router.get("/me", authMiddleware, (req, res) => {
  userController.getCurrentUser(req, res);
});
// router.put("/me", authMiddleware, (req, res) => {
//   userController.updateProfile(req, res);
// });

export default router;
