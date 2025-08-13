import cors from "cors";
import express, { Application, Request, Response } from "express";
import { envVars } from "./app/config/env.config";

export const app: Application = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Hello world",
  });
});

