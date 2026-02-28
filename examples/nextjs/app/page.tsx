"use client";

import { PayButton, PaymentStatus } from "@goblink/merchant-sdk/react";
import { useState } from "react";

export default function CheckoutPage() {
  const [paymentId, setPaymentId] = useState<string | null>(null);

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", fontFamily: "system-ui" }}>
      <h1>goBlink Checkout Example</h1>
      <p>Accept crypto payments with goBlink</p>

      <div style={{ marginTop: "2rem" }}>
        <h2>Pay $9.99</h2>
        <PayButton
          apiKey={process.env.NEXT_PUBLIC_GOBLINK_API_KEY!}
          amount={9.99}
          currency="USD"
          onSuccess={(id) => {
            setPaymentId(id);
            console.log("Payment successful:", id);
          }}
          onError={(err) => {
            console.error("Payment error:", err);
            alert("Payment failed: " + err.message);
          }}
        />
      </div>

      {paymentId && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Payment Status</h2>
          <PaymentStatus
            paymentId={paymentId}
            apiKey={process.env.NEXT_PUBLIC_GOBLINK_API_KEY!}
            onComplete={(status) => console.log("Final status:", status)}
          />
        </div>
      )}
    </main>
  );
}
