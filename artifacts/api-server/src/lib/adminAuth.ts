import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

const FIREBASE_API_KEY =
  process.env.VITE_FIREBASE_API_KEY ?? "AIzaSyD_Pdi5xvzp1JTjj9eGxBZDWiThlB2Gge4";
const ADMIN_EMAIL = "ban.alhaideri369@gmail.com";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();
  if (!token) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }
  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      },
    );
    if (!resp.ok) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    const data = (await resp.json()) as { users?: Array<{ email?: string }> };
    const email = data.users?.[0]?.email;
    if (email !== ADMIN_EMAIL) {
      res.status(403).json({ error: "Forbidden: admin access only" });
      return;
    }
    next();
  } catch (err) {
    logger.error({ err }, "Admin auth verification failed");
    res.status(500).json({ error: "Auth verification failed" });
  }
}
