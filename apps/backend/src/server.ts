import express, { Express } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { trpcExpressMiddleware } from "@workspace/trpc";
import { auth } from "@workspace/auth";

import apiRoutes from "./routes/index";
import { errorHandler } from "./middlewares/error-handler";

const app: Express = express();

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
    credentials: true,
  })
); // Enable CORS

// Better Auth Routes
app.all("/api/v1/auth/{*any}", toNodeHandler(auth));

// TRPC middleware
app.use("/api/v1/trpc", trpcExpressMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Image Gallery
app.use("/api/v1", apiRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
