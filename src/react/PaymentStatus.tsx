import React, { useState, useEffect, useRef } from "react";
import type { PaymentStatus as PaymentStatusType } from "../types.js";

export interface PaymentStatusProps {
  paymentId: string;
  apiKey: string;
  onComplete?: (status: PaymentStatusType) => void;
  onError?: (error: Error) => void;
  pollInterval?: number;
  baseUrl?: string;
}

const statusLabels: Record<PaymentStatusType, string> = {
  pending: "Waiting for payment",
  processing: "Processing payment",
  confirmed: "Payment confirmed",
  failed: "Payment failed",
  expired: "Payment expired",
  refunded: "Payment refunded",
};

const statusColors: Record<PaymentStatusType, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  confirmed: "#10b981",
  failed: "#ef4444",
  expired: "#6b7280",
  refunded: "#8b5cf6",
};

const stages: PaymentStatusType[] = [
  "pending",
  "processing",
  "confirmed",
];

const containerStyle: React.CSSProperties = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  maxWidth: "360px",
};

const stageRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "8px 0",
};

const dotStyle = (active: boolean, color: string): React.CSSProperties => ({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  backgroundColor: active ? color : "#d1d5db",
  transition: "background-color 0.3s",
  flexShrink: 0,
});

const labelStyle = (active: boolean): React.CSSProperties => ({
  fontSize: "14px",
  color: active ? "#111827" : "#9ca3af",
  fontWeight: active ? 600 : 400,
  transition: "color 0.3s",
});

export function PaymentStatus({
  paymentId,
  apiKey,
  onComplete,
  onError,
  pollInterval = 3000,
  baseUrl = "https://merchant.goblink.io/api/v1",
}: PaymentStatusProps) {
  const [status, setStatus] = useState<PaymentStatusType>("pending");
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${baseUrl}/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { status: PaymentStatusType };
        setStatus(data.status);

        if (["confirmed", "failed", "expired", "refunded"].includes(data.status)) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete?.(data.status);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message);
        onError?.(error);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, pollInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paymentId, apiKey, baseUrl, pollInterval, onComplete, onError]);

  if (error) {
    return (
      <div style={{ ...containerStyle, borderColor: "#fca5a5" }}>
        <p style={{ color: "#ef4444", margin: 0 }}>Error: {error}</p>
      </div>
    );
  }

  const color = statusColors[status];
  const currentIndex = stages.indexOf(status);
  const isFinal = ["failed", "expired", "refunded"].includes(status);

  return (
    <div style={containerStyle}>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "16px",
          color,
        }}
      >
        {statusLabels[status]}
      </div>
      {!isFinal ? (
        stages.map((stage, i) => (
          <div key={stage} style={stageRowStyle}>
            <div style={dotStyle(i <= currentIndex, color)} />
            <span style={labelStyle(i <= currentIndex)}>
              {statusLabels[stage]}
            </span>
          </div>
        ))
      ) : (
        <div style={stageRowStyle}>
          <div style={dotStyle(true, color)} />
          <span style={labelStyle(true)}>{statusLabels[status]}</span>
        </div>
      )}
    </div>
  );
}
