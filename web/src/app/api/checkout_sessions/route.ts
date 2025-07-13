import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";

export async function POST() {
    try {
        const headersList = await headers();
        const origin = headersList.get("origin");

        // Create a Checkout Session
        const session = await stripe.checkout.sessions.create({
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
        console.log("Checkout session created:", session);
        return NextResponse.redirect(session.url!, 303);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("Error creating checkout session:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}