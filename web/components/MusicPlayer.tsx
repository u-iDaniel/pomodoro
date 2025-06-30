import { Box, Typography, Button, TextField } from "@mui/material";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState, useEffect } from "react";

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
}

export default function MusicPlayer() {
  const [playlistIdInput, setPlaylistIdInput] = useState<string>("");
  const [submittedPlaylistId, setSubmittedPlaylistId] = useState<string | null>(
    null
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recentPlaylists, setRecentPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const storedPlaylists = localStorage.getItem("recentPlaylists");
    if (storedPlaylists) {
      setRecentPlaylists(JSON.parse(storedPlaylists));
    }
  }, []);

  const extractPlaylistId = (input: string): string | null => {
    try {
      if (input.startsWith("https://open.spotify.com/playlist/")) {
        const url = new URL(input);
        const pathParts = url.pathname.split('/');
        return pathParts[pathParts.length - 1];
      }
      // Assuming it's a raw ID if not a URL
      return input;
    } catch (error) {
      console.error("Invalid URL or ID:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    const id = extractPlaylistId(playlistIdInput.trim());
    if (id) {
      try {
        const response = await fetch(`/api/spotify/playlist/${id}`);
        if (!response.ok) {
          throw new Error("Playlist not found");
        }
        const playlistData = await response.json();

        if (playlistData.notFound) {
          alert(
            "The resource was potentially not found. If it was a Spotify account playlist, it should still work."
          );
          setSubmittedPlaylistId(id);
        } else {
          setSubmittedPlaylistId(id);

          const newRecentPlaylists = [
            playlistData,
            ...recentPlaylists.filter((p) => p.id !== id),
          ].slice(0, 5);

          setRecentPlaylists(newRecentPlaylists);
          localStorage.setItem(
            "recentPlaylists",
            JSON.stringify(newRecentPlaylists)
          );
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
        alert("Invalid Spotify Playlist URL or ID");
      }
    } else {
      alert("Invalid Spotify Playlist URL or ID");
    }
  };

  const handleBack = () => {
    setSubmittedPlaylistId(null);
    setPlaylistIdInput("");
  };

  const handleRecentPlaylistClick = (id: string) => {
    setSubmittedPlaylistId(id);
  };

  return (
    <Box
      sx={{
        width: 450,
        height: isCollapsed ? "auto" : submittedPlaylistId ? 700 : "auto",
        maxHeight: 700,
        background: "var(--tertiary)",
        borderRadius: "20px",
        p: 2,
        display: "flex",
        flexDirection: "column",
        color: "white",
        transition: "height 0.3s ease-in-out, max-height 0.3s ease-in-out",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 1,
          mb: isCollapsed ? 0 : 2,
          cursor: "pointer",
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Typography variant="h6" component="h1" sx={{ fontWeight: "bold" }}>
          music player <HeadphonesIcon sx={{ verticalAlign: "middle" }} />
        </Typography>
        {isCollapsed ? (
          <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
        ) : (
          <KeyboardArrowUpIcon sx={{ fontSize: 40 }} />
        )}
      </Box>

      {!isCollapsed && (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {submittedPlaylistId ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                  onClick={handleBack}
                  sx={{ color: 'white', minWidth: 'auto', p: 1, mr: 1 }}
                  aria-label="Back to playlist input"
                >
                  ←
                </Button>
                <Typography variant="h6" sx={{color: 'white' }}>
                  connected playlist
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, borderRadius: '12px', overflow: 'hidden', height: '600px' }}>
                <iframe
                  src={`https://open.spotify.com/embed/playlist/${submittedPlaylistId}?theme=0`}
                  width="100%"
                  height="100%"
                  allowFullScreen
                  allow="autoplay; encrypted-media; clipboard-write"
                  loading="lazy"
                  style={{ borderRadius: '12px' }}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '90%', alignItems: 'center', pb: 2 }}>
              {recentPlaylists.length > 0 && (
                <Box sx={{ width: "100%", mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    recent playlists:
                  </Typography>
                  {recentPlaylists.map((playlist) => (
                    <Box
                      key={playlist.id}
                      onClick={() => handleRecentPlaylistClick(playlist.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1,
                        borderRadius: "8px",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      <img
                        src={playlist.images[0]?.url}
                        alt={playlist.name}
                        width={50}
                        height={50}
                        style={{ borderRadius: "4px" }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: "bold" }}>
                          {playlist.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          {playlist.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              <Typography sx={{ textAlign: 'center' }}>enter a public Spotify playlist id or url (on the spotify app, go to share -{'>'} copy link to playlist) </Typography>
              <TextField
                label="playlist ID or URL"
                variant="outlined"
                value={playlistIdInput}
                onChange={(e) => setPlaylistIdInput(e.target.value)}
                fullWidth
                slotProps={{
                  inputLabel: { 
                    style: { 
                      color: 'rgba(255, 255, 255, 0.7)'
                    } 
                  },
                }}
                sx={{
                  input: { color: 'white' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1DB954',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ backgroundColor: "#1DB954", color: "white", fontWeight: "bold", borderRadius: "50px", px: 4, py: 1, '&:hover': { backgroundColor: "#1ed760" } }}
              >
                connect playlist
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}