import { getPlaylist } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  const { playlistId } = await params;
  
  try {
    const playlist = await getPlaylist(playlistId);
    return NextResponse.json(playlist);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
