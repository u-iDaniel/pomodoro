import { getAlbum } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  const { albumId } = await params;
  try {
    const album = await getAlbum(albumId);
    return NextResponse.json(album);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
