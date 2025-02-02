import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRoutes } from "./app/modules/user/user.routes";
import { reelRoutes } from "./app/modules/reel/reel.routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

const app: Application = express();

//middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/reel", reelRoutes);

app.get("/", (req, res) => {
  res.send("Welcome To PH Reel Server");
});

//middlewares
app.use(globalErrorHandler);
app.use(notFound);

export default app;
