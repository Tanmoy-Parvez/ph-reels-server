import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRoutes } from "./app/modules/user/user.routes";
import { reelRoutes } from "./app/modules/reel/reel.routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { logger } from "./app/utils/logger";

const app: Application = express();

//middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();
  const { method, originalUrl, body, query } = req;

  logger.info(`➡️  ${method} ${originalUrl}`, {
    method,
    url: originalUrl,
    body,
    query,
  });

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    logger.info(
      `✅ ${method} ${originalUrl} - ${res.statusCode} (${durationMs} ms)`,
      {
        method,
        url: originalUrl,
        status: res.statusCode,
        duration: `${durationMs} ms`,
      }
    );
  });

  next();
});

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/reel", reelRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome To PH Reel Server!",
  });
});

//middlewares
app.use(globalErrorHandler);
app.use(notFound);

export default app;
