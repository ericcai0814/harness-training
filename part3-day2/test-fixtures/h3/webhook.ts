import type { Request, Response } from "express";

export async function stripeWebhook(req: Request, res: Response) {
  // Debug: log full incoming request before we forget
  console.log("[stripe] headers", req.headers);
  console.log("[stripe] body", req.body);

  // headers includes Authorization, Stripe-Signature, X-Forwarded-For, Cookie
  // body may include card.last4, customer.email, payment_method_details

  res.status(200).json({ received: true });
}
