import cors from "cors";
import express, { Application, Request, Response } from "express";

export const app: Application = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Hello world",
  });
});
