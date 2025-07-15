import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import { auth } from "@/configuration/auth";

export async function POST() {
    const session = await auth();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const headersList = await headers();
        const origin = headersList.get("origin");

        // Create a Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_intent_data: {
                metadata: {
                    userId: session.user.id, // Replace with actual user ID logic
                },
            },
            metadata: {
                userId: session.user.id, // Replace with actual user ID logic
            },
            line_items: [
                {
                    price: "price_1RjENBPDhVFLHKvCkV9qTUjO",
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing?canceled=true`,
        });
        console.log("Checkout session created:", checkoutSession);
        return NextResponse.redirect(checkoutSession.url!, 303);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("Error creating checkout session:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}