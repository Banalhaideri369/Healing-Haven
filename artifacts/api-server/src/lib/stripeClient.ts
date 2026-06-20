import Stripe from "stripe";

export async function getStripeClient(): Promise<Stripe> {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY environment variable is required but was not set.",
    );
  }
  return new Stripe(key);
}
