import cookieParser from "cookie-parser";
import cors, { CorsOptionsDelegate } from "cors";
import express, { Application, Request, Response } from "express";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import "./app/modules/event/listeners/commission.listener";
import "./app/modules/event/listeners/event.SystemUpdateListener";
import "./app/modules/event/listeners/event.auditLog.listener";
import "./app/modules/event/listeners/event.sendSmsListener";
import "./app/modules/event/listeners/event.transactionListener";
import { router } from "./app/routes";

export const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://amar-taka.vercel.app",
];
const corsOptionsDelegate: CorsOptionsDelegate<Request> = (req, callback) => {
  const origin = req.header("Origin");

  if (origin && allowedOrigins.includes(origin)) {
    callback(null, {
      origin: origin,
      credentials: true,
    });
  } else {
    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  }
};

app.use(cors(corsOptionsDelegate));

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Hello world",
  });
});

app.use(notFound);

app.use(globalErrorHandler);
