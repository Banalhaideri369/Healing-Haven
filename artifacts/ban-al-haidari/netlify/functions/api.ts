import serverless from "serverless-http";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
// Cross-artifact import — resolved by esbuild when Netlify bundles the function
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import router from "../../../api-server/src/routes";

const app = express();

app.use(
  cors({
    origin: process.env["CORS_ORIGIN"] ?? "*",
    credentials: true,
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Shim for req.log used by route handlers (replaces pino-http in serverless context)
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as unknown as Record<string, unknown>)["log"] = {
    error: (obj: unknown, msg?: string) => console.error(msg ?? "", obj),
    warn:  (obj: unknown, msg?: string) => console.warn(msg ?? "", obj),
    info:  (obj: unknown, msg?: string) => console.info(msg ?? "", obj),
  };
  next();
});

// Mount router without /api prefix.
// Netlify's redirect strips "/api" via: from="/api/*" to="/.netlify/functions/api/:splat"
// so Express receives "/courses/recorded", "/profile", "/bookings", etc.
app.use(router);

export const handler = serverless(app);
