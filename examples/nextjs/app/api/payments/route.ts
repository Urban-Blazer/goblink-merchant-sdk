import { GoBlink } from "@goblink/merchant-sdk";
import { NextResponse } from "next/server";

const goblink = new GoBlink({
  apiKey: process.env.GOBLINK_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payment = await goblink.payments.create({
      amount: body.amount,
      currency: body.currency ?? "USD",
      orderId: body.orderId,
      returnUrl: body.returnUrl,
    });
    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const payments = await goblink.payments.list({
      status: searchParams.get("status") as "pending" | "confirmed" | undefined,
      limit: Number(searchParams.get("limit")) || 20,
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error("List payments error:", error);
    return NextResponse.json(
      { error: "Failed to list payments" },
      { status: 500 },
    );
  }
}
