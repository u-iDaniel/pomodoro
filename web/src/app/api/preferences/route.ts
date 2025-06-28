import { NextResponse } from "next/server";
import { auth } from "@/configuration/auth";
import prisma from "@/lib/prisma";
import { getRandomSongByGenre } from "@/lib/spotify";

async function predictGenre(text: string): Promise<string> {
  const response = await fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('AI prediction failed');
  }

  const data = await response.json();
  return data.prediction;
}

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { preferenceType, preferenceDetail } = await req.json();

        if (!preferenceType || !preferenceDetail) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Get genre prediction from AI model
        const predictedGenre = await predictGenre(preferenceDetail);

        // Get a random song from Spotify based on the predicted genre
        const song = await getRandomSongByGenre(predictedGenre);

        // Store preference in database
        const preference = await prisma.preference.create({
            data: {
                userid: session.user.id!,
                preferencetype: preferenceType,
                preferencedetail: preferenceDetail,
                predictedGenre,
                spotifyTrackId: song.id,
            },
        });

        return NextResponse.json({
            message: "Preference saved!",
            preference,
            predictedGenre,
            song: {
                id: song.id,
                name: song.name,
                artist: song.artists[0].name,
                preview_url: song.preview_url,
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Error processing preference:", error);
        return NextResponse.json({ error: "Processing error" }, { status: 500 });
    }
}

export async function GET() {
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const preference = await prisma.preference.findFirst({
            where: {
                userid: session.user.id!,
            },
            orderBy: {
                taskid: 'desc'
            }
        });

        return NextResponse.json({ preference }, { status: 200 });
    } catch (error) {
        console.error("Error fetching preference:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
