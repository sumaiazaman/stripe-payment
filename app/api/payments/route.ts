import { NextResponse } from "next/server";
import { getAllPayments } from "@/lib/paymentStore";

export async function GET() {
  const payments = await getAllPayments();
  return NextResponse.json(payments);
}
