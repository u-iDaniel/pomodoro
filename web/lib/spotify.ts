import { getValidToken } from './spotifyAuth';

const SPOTIFY_API = 'https://api.spotify.com/v1';

interface SimplifiedPlaylistObject {
  collaborative: boolean;
  description: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: Array<{
    height: number;
    url: string;
    width: number;
  }>;
  name: string;
  owner: {
    display_name: string;
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
  };
  public: boolean;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: string;
  uri: string;
}

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

export async function getUserPlaylists(userAccessToken: string, userId: string) {
  const response = await fetch(
    `${SPOTIFY_API}/users/${userId}/playlists`, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`
      }
    });

  const data = await response.json();
  if (!data.items) {
    throw new Error('No playlists found for this user');
  }

  return data.items.map((playlist: SimplifiedPlaylistObject) => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    imageUrl: playlist.images[0]?.url || '',
  }));
}

export async function getUserId(userAccessToken: string) {
  const response = await fetch(`${SPOTIFY_API}/me`, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  });
  const data = await response.json();
  if (!data.id) {
    throw new Error('Failed to retrieve user ID');
  }
  return data.id;
}