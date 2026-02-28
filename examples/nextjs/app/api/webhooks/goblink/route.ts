import { createWebhookHandler } from "@goblink/merchant-sdk/nextjs";

export const POST = createWebhookHandler({
  secret: process.env.GOBLINK_WEBHOOK_SECRET!,
  onPaymentCreated: async (payment) => {
    console.log("Payment created:", payment.id, payment.amount);
  },
  onPaymentConfirmed: async (payment) => {
    console.log("Payment confirmed:", payment.id);
    // TODO: Fulfill the order — update database, send email, etc.
  },
  onPaymentFailed: async (payment) => {
    console.log("Payment failed:", payment.id);
    // TODO: Handle failed payment
  },
  onPaymentExpired: async (payment) => {
    console.log("Payment expired:", payment.id);
  },
});
