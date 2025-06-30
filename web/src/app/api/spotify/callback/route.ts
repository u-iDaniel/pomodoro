import { getValidUserToken } from "@/lib/spotifyAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (state === null) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set("error", "state_mismatch");
    return NextResponse.redirect(url);
  }

  if (!code) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set("error", "missing_code");
    return NextResponse.redirect(url);
  }

  const redirectUri = process.env.NODE_ENV === 'production' ? process.env.SPOTIFY_REDIRECT_URI : process.env.SPOTIFY_DEV_REDIRECT_URI;
  try {
    const tokenData = await getValidUserToken(code, redirectUri!);
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('spotify_access_token', tokenData.access_token);
    url.searchParams.set('spotify_refresh_token', tokenData.refresh_token); // Also good to pass the refresh token
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error during Spotify authentication:", error);
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set("error", "authentication_failed");
    return NextResponse.redirect(url);
  }
}
