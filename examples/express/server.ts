import express from "express";
import { GoBlink } from "@goblink/merchant-sdk";
import { webhookHandler } from "@goblink/merchant-sdk/webhooks";

const app = express();
const port = process.env.PORT || 3001;

const goblink = new GoBlink({
  apiKey: process.env.GOBLINK_API_KEY!,
});

// Webhook endpoint — must use raw body for signature verification
app.post(
  "/webhooks/goblink",
  express.raw({ type: "application/json" }),
  webhookHandler({
    secret: process.env.GOBLINK_WEBHOOK_SECRET!,
    onPaymentCreated: async (payment) => {
      console.log("Payment created:", payment.id);
    },
    onPaymentConfirmed: async (payment) => {
      console.log("Payment confirmed:", payment.id);
      // TODO: Fulfill the order
    },
    onPaymentFailed: async (payment) => {
      console.log("Payment failed:", payment.id);
    },
    onPaymentExpired: async (payment) => {
      console.log("Payment expired:", payment.id);
    },
  }),
);

app.use(express.json());

// Create a payment
app.post("/payments", async (req, res) => {
  try {
    const payment = await goblink.payments.create({
      amount: req.body.amount,
      currency: req.body.currency ?? "USD",
      orderId: req.body.orderId,
      returnUrl: req.body.returnUrl,
      metadata: req.body.metadata,
    });
    res.json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// Get payment by ID
app.get("/payments/:id", async (req, res) => {
  try {
    const payment = await goblink.payments.get(req.params.id);
    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: "Failed to get payment" });
  }
});

// List payments
app.get("/payments", async (req, res) => {
  try {
    const payments = await goblink.payments.list({
      status: req.query.status as "pending" | "confirmed" | undefined,
      limit: Number(req.query.limit) || 20,
    });
    res.json(payments);
  } catch (error) {
    console.error("List payments error:", error);
    res.status(500).json({ error: "Failed to list payments" });
  }
});

// Refund a payment
app.post("/payments/:id/refund", async (req, res) => {
  try {
    const refund = await goblink.payments.refund(req.params.id, {
      amount: req.body.amount,
      reason: req.body.reason,
    });
    res.json(refund);
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ error: "Failed to refund payment" });
  }
});

// Merchant profile
app.get("/merchant", async (_req, res) => {
  try {
    const merchant = await goblink.merchant.get();
    res.json(merchant);
  } catch (error) {
    console.error("Merchant error:", error);
    res.status(500).json({ error: "Failed to get merchant" });
  }
});

app.listen(port, () => {
  console.log(`goBlink Express server running on port ${port}`);
});
