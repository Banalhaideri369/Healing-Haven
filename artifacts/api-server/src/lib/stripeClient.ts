import Stripe from "stripe";
import { logger } from "./logger";

async function getStripeSecretKey(): Promise<string> {
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = process.env["REPL_IDENTITY"]
    ? "repl " + process.env["REPL_IDENTITY"]
    : process.env["WEB_REPL_RENEWAL"]
      ? "depl " + process.env["WEB_REPL_RENEWAL"]
      : null;

  if (hostname && xReplitToken) {
    try {
      const resp = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
        {
          headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (resp.ok) {
        const data = (await resp.json()) as {
          items?: Array<{ settings?: { secret_key?: string } }>;
        };
        const key = data.items?.[0]?.settings?.secret_key;
        if (key) return key;
      }
    } catch (err) {
      logger.warn({ err }, "Failed to fetch Stripe credentials from Replit connector");
    }
  }

  throw new Error(
    "Stripe integration not connected. " +
      "Connect Stripe via the Integrations tab in Replit.",
  );
}

export async function getStripeClient(): Promise<Stripe> {
  const secretKey = await getStripeSecretKey();
  return new Stripe(secretKey);
}
