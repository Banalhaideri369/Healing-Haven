import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

declare global {
  namespace Express {
    interface Request {
      userEmail?: string;
      userId?: string;
    }
  }
}

const FIREBASE_API_KEY =
  process.env.VITE_FIREBASE_API_KEY ?? "AIzaSyD_Pdi5xvzp1JTjj9eGxBZDWiThlB2Gge4";
const ADMIN_EMAIL = "ban.alhaideri369@gmail.com";

interface FirebaseUser {
  localId?: string;
  email?: string;
}

/** Verify a Firebase ID token; returns { uid, email } or null */
export async function verifyToken(token: string): Promise<{ uid: string; email: string } | null> {
  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      },
    );
    if (!resp.ok) return null;
    const data = (await resp.json()) as { users?: FirebaseUser[] };
    const user = data.users?.[0];
    if (!user?.localId || !user?.email) return null;
    return { uid: user.localId, email: user.email };
  } catch {
    return null;
  }
}

/** Middleware: require any authenticated user; attaches userEmail + userId to req */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = (req.headers.authorization ?? "").replace("Bearer ", "").trim();
  if (!token) { res.status(401).json({ error: "Missing authorization token" }); return; }
  const user = await verifyToken(token);
  if (!user) { res.status(401).json({ error: "Invalid or expired token" }); return; }
  req.userEmail = user.email;
  req.userId = user.uid;
  next();
}

/** Middleware: require admin (ban.alhaideri369@gmail.com) */
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
    const user = await verifyToken(token);
    if (!user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      res.status(403).json({ error: "Forbidden: admin access only" });
      return;
    }
    req.userEmail = user.email;
    req.userId = user.uid;
    next();
  } catch (err) {
    logger.error({ err }, "Admin auth verification failed");
    res.status(500).json({ error: "Auth verification failed" });
  }
}
