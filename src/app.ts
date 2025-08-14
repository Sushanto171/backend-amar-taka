import cors from "cors";
import express, { Application, Request, Response } from "express";
import { router } from "./app/routes";

export const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Hello world",
  });
});
