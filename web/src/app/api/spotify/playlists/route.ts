import { NextRequest, NextResponse } from 'next/server';
import { getUserId, getUserPlaylists } from '@/lib/spotify';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header missing' }, { status: 401 });
    }

    const userAccessToken = authHeader.split(' ')[1];
    console.log('User Access Token:', userAccessToken);

    // Use the access token to get the user's Spotify ID
    const userId = await getUserId(userAccessToken);
    
    // Fetch the user's playlists
    const playlists = await getUserPlaylists(userAccessToken, userId);

    return NextResponse.json(playlists);

  } catch (error) {
    console.error('API Error fetching playlists:', error);
    return NextResponse.json(error, { status: 500 });
  }
}