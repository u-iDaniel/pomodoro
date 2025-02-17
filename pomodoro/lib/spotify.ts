import { getValidToken } from './spotifyAuth';

const SPOTIFY_API = 'https://api.spotify.com/v1';

export async function getRandomSongByGenre(genre: string) {
  try {
    const accessToken = await getValidToken();
    
    // Search for tracks in the genre
    const response = await fetch(
      `${SPOTIFY_API}/search?q=genre:${genre}&type=track&limit=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!data.tracks?.items?.length) {
      throw new Error('No tracks found for this genre');
    }

    // Pick a random track from the results
    const randomIndex = Math.floor(Math.random() * data.tracks.items.length);
    return data.tracks.items[randomIndex];
  } catch (error) {
    console.error('Spotify API error:', error);
    throw error;
  }
}
