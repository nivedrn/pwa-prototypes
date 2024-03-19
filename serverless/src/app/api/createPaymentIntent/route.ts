import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const requestData = await req.json();
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(requestData.amount) * 100,
      currency: "EUR",
    });

    return new NextResponse(JSON.stringify({ client_secret : paymentIntent.client_secret}), { status: 200 });
  } catch (error: any) {
    return new NextResponse(error, {
      status: 400,
    });
  }
}