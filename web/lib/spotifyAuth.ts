interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

let tokenData: SpotifyToken | null = null;

export async function getValidToken(): Promise<string> {
  // Check if we have a valid token
  if (tokenData && tokenData.expires_at > Date.now()) {
    return tokenData.access_token;
  }

  // Get new token
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  console.log(response);

  if (!response.ok) {
    throw new Error('Failed to get Spotify token');
  }

  const data = await response.json();
  
  // Store token with expiration
  tokenData = {
    ...data,
    expires_at: Date.now() + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
  };

  return tokenData!.access_token;
}
