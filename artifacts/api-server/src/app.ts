import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const rawCorsOrigin = process.env["CORS_ORIGIN"] ?? "";
const allowedOrigins: string[] = rawCorsOrigin
  ? rawCorsOrigin.split(",").map((o) => o.trim()).filter(Boolean)
  : [
      "https://ban-infinity369.com",
      "https://www.ban-infinity369.com",
      "https://healing-haven.netlify.app",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl (no Origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Log rejections to help diagnose unexpected origins
      logger.warn({ origin, allowedOrigins }, "CORS: origin not allowed");
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/", (_req, res) => res.status(200).send("OK"));

app.use("/api", router);

export default app;
