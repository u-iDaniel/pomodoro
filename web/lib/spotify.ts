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

interface SimplifiedAlbumObject {
  album_type: "album" | "single" | "compilation";
  artists: Array<{
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
  }>;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: Array<{
    height: number;
    width: number;
    url: string;
  }>;
  name: string;
  popularity: number;
  release_date: string; // YYYY-MM-DD
  release_date_precision: "year" | "month" | "day";
  total_tracks: number;
  type: "album";
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch playlists from Spotify: ${response.status} - ${errorText}`);
  }

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
    const errorText = await response.text();
    throw new Error(`Failed to retrieve user ID: ${response.status} - ${errorText}`);
  }
  return data.id;
}

export async function getPlaylist(playlistId: string): Promise<SimplifiedPlaylistObject | { notFound: true }> {
  const accessToken = await getValidToken();
  const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return { notFound: true };
    }
    throw new Error(`Failed to fetch playlist: ${response.status} - ${await response.text()}`);
  }

  return response.json();
}

export async function getAlbum(albumId: string): Promise<SimplifiedAlbumObject | { notFound: true }> {
  const accessToken = await getValidToken();
  const response = await fetch(`${SPOTIFY_API}/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      return { notFound: true };
    }
    throw new Error(`Failed to fetch album: ${response.status} - ${await response.text()}`);
  }
  return response.json();
}