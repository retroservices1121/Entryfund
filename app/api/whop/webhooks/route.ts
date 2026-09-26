import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  // TODO: Verify Whop webhook signature before trusting the payload.
  // TODO: Reconcile checkout payments, card transactions, refunds and payouts.
  console.log("Whop webhook received", payload?.type ?? "unknown");

  return NextResponse.json({ received: true });
}
