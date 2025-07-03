function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
} 

export async function GET() {
  const redirectUri = process.env.NODE_ENV === 'production' ? process.env.SPOTIFY_REDIRECT_URI : process.env.SPOTIFY_DEV_REDIRECT_URI;
  const state = generateRandomString(16);
  const redirectUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&state=${state}&scope=user-read-email playlist-read-private playlist-read-collaborative`;
  return Response.redirect(redirectUrl, 302);
}