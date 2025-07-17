import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const signature = req.headers.get("stripe-signature");
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const body = await req.text();
    let event: Stripe.Event;
    try {
        if (!signature || !endpointSecret) {
            throw new Error("Missing Stripe signature or endpoint secret");
        }

        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            endpointSecret
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response("Webhook Error", { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const session = event.data.object as Stripe.PaymentIntent;
            const userId = session.metadata?.userId;
            if (!userId) {
                console.error("Payment intent succeeded but no userId found in metadata");
                return new Response("User ID not found", { status: 400 });
            }
            const data = await prisma.users.update({
                where: { userid: userId },
                data: { ismember: true },
            });
            console.log("User membership updated:", data);
            break;
        }
        default:
            console.warn(`Unhandled event type ${event.type}`);
    }

    return new NextResponse("Webhook received", { status: 200 });
}