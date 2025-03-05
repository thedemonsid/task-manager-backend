import express from "express";
import userRoutes from "./routes/userRoutes";
import taskRoutes from "./routes/taskRoutes";
// import dashboardRoutes from './routes/dashboardRoutes';

const app = express();
const PORT =  3000;

app.use(express.json());
// Request logger middleware - logs whenever someone hits the backend
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} request to ${req.originalUrl}`);
  next();
});
// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
// app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
