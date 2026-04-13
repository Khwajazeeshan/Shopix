import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Create a PaymentIntent with the specified amount
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: "pkr", // Replace with your desired currency
            payment_method_types: ["card"],
        });

        return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error: any) {
        console.error("Stripe error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
