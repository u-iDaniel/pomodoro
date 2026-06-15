import * as cheerio from 'cheerio';
import { getValidToken } from './spotifyAuth';

const SPOTIFY_API = 'https://api.spotify.com/v1';

interface SpotifyEmbedEntity {
  title?: string;
  subtitle?: string;
  coverArt?: {
    sources?: Array<{
      url?: string;
    }>;
  };
  visualIdentity?: {
    image?: Array<{
      url?: string;
    }>;
  };
  artists?: Array<{
    name?: string;
  }>;
}

interface SpotifyEmbedNextData {
  props?: {
    pageProps?: {
      state?: {
        data?: {
          entity?: SpotifyEmbedEntity;
        };
      };
    };
  };
}

interface SimplifiedPlaylistObject {
  collaborative: boolean;
  description?: string;
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
  album_type: 'album' | 'single' | 'compilation';
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
  popularity?: number;
  release_date?: string;
  release_date_precision?: 'year' | 'month' | 'day';
  total_tracks: number;
  type: 'album';
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

function parseSpotifyEmbedMetadata(html: string): SpotifyEmbedEntity | null {
  const match = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/i);

  if (!match?.[1]) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[1]) as SpotifyEmbedNextData;
    return parsed.props?.pageProps?.state?.data?.entity || null;
  } catch {
    return null;
  }
}

function getBestImageUrl(sources?: Array<{ url?: string }>) {
  return sources?.find((source) => source.url)?.url || '';
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function normalizeEmbeddedText(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, ' ').trim();
}

function getFirstEmbeddedText($: cheerio.CheerioAPI, selectors: string[]) {
  for (const selector of selectors) {
    const normalizedText = normalizeEmbeddedText($(selector).first().text());
    if (normalizedText) {
      return normalizedText;
    }
  }

  return '';
}

async function fetchSpotifyEmbedPage(entityType: 'playlist' | 'album', entityId: string) {
  const response = await fetch(`https://open.spotify.com/embed/${entityType}/${entityId}?theme=0&limit=10000`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${entityType} embed: ${response.status} - ${await response.text()}`);
  }

  return response.text();
}

function parseSpotifyEmbedPage(html: string, entity?: SpotifyEmbedEntity | null) {
  const $ = cheerio.load(html);
  const titleFromMetadata = normalizeEmbeddedText(entity?.title || '');
  const artistFromMetadata = normalizeEmbeddedText(entity?.subtitle || entity?.artists?.[0]?.name || '');

  return {
    title: titleFromMetadata || getFirstEmbeddedText($, ['h1[data-testid="entity-title"] a', 'h1[data-testid="entity-title"]']),
    artist: artistFromMetadata || getFirstEmbeddedText($, ['h2[data-testid="subtitle"] a', 'h2[data-testid="subtitle"]']),
    imageUrl:
      $('img[alt$=" cover"]').first().attr('src') ||
      getBestImageUrl(entity?.coverArt?.sources || entity?.visualIdentity?.image),
  };
}

function getEmbedImageUrl(html: string, entity?: SpotifyEmbedEntity | null) {
  return parseSpotifyEmbedPage(html, entity).imageUrl;
}

async function getPlaylistFromEmbed(playlistId: string): Promise<SimplifiedPlaylistObject> {
  const html = await fetchSpotifyEmbedPage('playlist', playlistId);
  const entity = parseSpotifyEmbedMetadata(html);
  const embedDetails = parseSpotifyEmbedPage(html, entity);
  const title = normalizeEmbeddedText(entity?.title || embedDetails.title || `Playlist ${playlistId}`);
  const ownerName = normalizeEmbeddedText(entity?.subtitle || embedDetails.artist || `Playlist ${playlistId}`);

  return {
    collaborative: false,
    description: '',
    external_urls: {
      spotify: `https://open.spotify.com/playlist/${playlistId}`,
    },
    href: `https://api.spotify.com/v1/playlists/${playlistId}`,
    id: playlistId,
    images: [
      {
        height: 0,
        width: 0,
        url: embedDetails.imageUrl || getEmbedImageUrl(html, entity),
      },
    ],
    name: title,
    owner: {
      display_name: ownerName,
      external_urls: {
        spotify: `https://open.spotify.com/playlist/${playlistId}`,
      },
      href: `https://open.spotify.com/playlist/${playlistId}`,
      id: ownerName || playlistId,
    },
    public: true,
    snapshot_id: '',
    tracks: {
      href: '',
      total: 0,
    },
    type: 'playlist',
    uri: `spotify:playlist:${playlistId}`,
  } as SimplifiedPlaylistObject;
}

async function getAlbumFromEmbed(albumId: string): Promise<SimplifiedAlbumObject> {
  const html = await fetchSpotifyEmbedPage('album', albumId);
  const entity = parseSpotifyEmbedMetadata(html);
  const embedDetails = parseSpotifyEmbedPage(html, entity);
  const title = normalizeEmbeddedText(entity?.title || embedDetails.title || `Album ${albumId}`);
  const artistName = normalizeEmbeddedText(entity?.artists?.[0]?.name || embedDetails.artist || `Album ${albumId}`);


  const artists = entity?.artists?.length
    ? entity.artists
        .filter((artist): artist is { name: string } => Boolean(artist.name))
        .map((artist) => ({
          external_urls: { spotify: '' },
          href: '',
          id: '',
          name: artist.name,
          type: 'artist',
          uri: '',
        }))
    : [
        {
          external_urls: { spotify: '' },
          href: '',
          id: '',
          name: artistName,
          type: 'artist',
          uri: '',
        },
      ];

  return {
    album_type: 'album',
    artists,
    external_urls: {
      spotify: `https://open.spotify.com/album/${albumId}`,
    },
    href: `https://api.spotify.com/v1/albums/${albumId}`,
    id: albumId,
    images: [
      {
        height: 0,
        width: 0,
        url: embedDetails.imageUrl || getEmbedImageUrl(html, entity),
      },
    ],
    name: title,
    total_tracks: 0,
    type: 'album',
    uri: `spotify:album:${albumId}`,
  } as SimplifiedAlbumObject;
}

export async function getPlaylist(playlistId: string): Promise<SimplifiedPlaylistObject> {
  const accessToken = await getValidToken();
  const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    return getPlaylistFromEmbed(playlistId);
  }
  return response.json();
}

export async function getAlbum(albumId: string): Promise<SimplifiedAlbumObject> {
  const accessToken = await getValidToken();
  const response = await fetch(`${SPOTIFY_API}/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    return getAlbumFromEmbed(albumId);
  }
  return response.json();
}