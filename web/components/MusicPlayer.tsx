import { Box, Typography, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress } from "@mui/material";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function MusicPlayer() {
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to get token from URL or localStorage
  useEffect(() => {
    const tokenFromUrl = searchParams.get("spotify_access_token");
    const refreshTokenFromUrl = searchParams.get("spotify_refresh_token");

    if (tokenFromUrl) {
      setAccessToken(tokenFromUrl);
      localStorage.setItem("spotify_access_token", tokenFromUrl);
      if (refreshTokenFromUrl) {
        localStorage.setItem("spotify_refresh_token", refreshTokenFromUrl);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const tokenFromStorage = localStorage.getItem("spotify_access_token");
      if (tokenFromStorage) {
        setAccessToken(tokenFromStorage);
      }
    }
  }, [searchParams]);

  // Effect to fetch playlists when accessToken is available
  useEffect(() => {
    if (accessToken) {
      const fetchPlaylists = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/spotify/playlists', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch playlists');
          }

          const data: Playlist[] = await response.json();
          setPlaylists(data);
        } catch (err: any) {
          setError(err?.message);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPlaylists();
    }
  }, [accessToken]);
  
  const handleSpotifySignIn = async () => {
    window.location.href = "/api/spotify/signin";
  };

  return (
    <Box
      sx={{
        width: 360,
        height: 640,
        background: "var(--tertiary)",
        borderRadius: "20px",
        p: 2,
        display: "flex",
        flexDirection: "column",
        color: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 1,
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h1" sx={{ fontWeight: "bold" }}>
          music player <HeadphonesIcon sx={{ verticalAlign: "middle" }} />
        </Typography>
        <KeyboardArrowUpIcon sx={{ fontSize: 40 }} />
      </Box>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!accessToken ? (
          <Button
            variant="contained"
            endIcon={<Image src={"/spotify-icon.svg"} alt="Spotify Logo" width={24} height={24} />}
            sx={{ backgroundColor: "#1DB954", color: "white", fontWeight: "bold", borderRadius: "50px", px: 4, py: 1.5, '&:hover': { backgroundColor: "#1ed760" } }}
            onClick={handleSpotifySignIn}
          >
            sign in with spotify
          </Button>
        ) : isLoading ? (
          <CircularProgress color="inherit" />
        ) : error ? (
          <Typography color="error">Error: {error}</Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {playlists.map((playlist) => (
              <ListItem key={playlist.id} sx={{ borderRadius: '8px', mb: 1 }}>
                <ListItemAvatar>
                  <Avatar variant="rounded" src={playlist.imageUrl} alt={playlist.name} />
                </ListItemAvatar>
                <ListItemText primary={playlist.name} secondary={playlist.description || 'No description'} 
                  primaryTypographyProps={{ color: 'white', fontWeight: 'bold', noWrap: true }}
                  secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)', noWrap: true }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}