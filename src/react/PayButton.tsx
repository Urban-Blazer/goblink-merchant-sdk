import React, { useState, useCallback } from "react";
import type { Currency, PaymentStatus } from "../types.js";

export interface PayButtonProps {
  apiKey: string;
  amount: number;
  currency?: Currency;
  orderId?: string;
  returnUrl?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
  theme?: "light" | "dark";
  className?: string;
  label?: string;
  baseUrl?: string;
}

const defaultStyles: Record<string, React.CSSProperties> = {
  light: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    transition: "opacity 0.2s",
  },
  dark: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#818cf8",
    color: "#0f172a",
    transition: "opacity 0.2s",
  },
};

export function PayButton({
  apiKey,
  amount,
  currency,
  orderId,
  returnUrl,
  onSuccess,
  onError,
  theme = "light",
  className,
  label = "Pay with Crypto",
  baseUrl = "https://merchant.goblink.io/api/v1",
}: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ amount, currency, orderId, returnUrl }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          (errorBody as Record<string, string>).message ||
            `Payment failed: ${response.status}`,
        );
      }

      const payment = (await response.json()) as {
        id: string;
        paymentUrl: string;
        status: PaymentStatus;
      };
      window.open(payment.paymentUrl, "_blank", "noopener,noreferrer");

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${baseUrl}/payments/${payment.id}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (!statusRes.ok) return;
          const statusData = (await statusRes.json()) as { status: PaymentStatus };
          if (statusData.status === "confirmed") {
            clearInterval(pollInterval);
            onSuccess?.(payment.id);
          } else if (
            statusData.status === "failed" ||
            statusData.status === "expired"
          ) {
            clearInterval(pollInterval);
            onError?.(new Error(`Payment ${statusData.status}`));
          }
        } catch {
          // Silently continue polling
        }
      }, 3000);

      // Stop polling after 30 minutes
      setTimeout(() => clearInterval(pollInterval), 30 * 60 * 1000);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }, [apiKey, amount, currency, orderId, returnUrl, baseUrl, onSuccess, onError]);

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={className ? undefined : defaultStyles[theme]}
      type="button"
    >
      {loading ? "Processing..." : label}
    </button>
  );
}
