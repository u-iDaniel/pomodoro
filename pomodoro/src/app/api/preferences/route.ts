import { NextResponse } from "next/server";
import { auth } from "@/configuration/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();

    // Ensure user is authenticated
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preferenceType, preferenceDetail } = await req.json();

    if (!preferenceType || !preferenceDetail) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        if (!session.user.id) {
            return NextResponse.json({ error: "User ID not found" }, { status: 400 });
        }

        // Store in database
        const preference = await prisma.preference.create({
            data: {
                userid: session.user.id,
                preferencetype: preferenceType,
                preferencedetail: preferenceDetail,
            },
        });

        return NextResponse.json(
            { message: "Preference saved!", preference },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error saving preference:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
