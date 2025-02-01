import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import { authRoutes } from "./app/modules/auth/auth.routes";

const app: Application = express();

// middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
