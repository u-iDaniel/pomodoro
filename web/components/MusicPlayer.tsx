import { Box, Typography, Button, TextField } from "@mui/material";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState } from "react";

export default function MusicPlayer() {
  const [playlistIdInput, setPlaylistIdInput] = useState<string>("");
  const [submittedPlaylistId, setSubmittedPlaylistId] = useState<string | null>(null);

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

  const handleSubmit = () => {
    const id = extractPlaylistId(playlistIdInput.trim());
    if (id) {
      setSubmittedPlaylistId(id);
    } else {
      // Maybe show an error to the user
      alert("Invalid Spotify Playlist URL or ID");
    }
  };

  const handleBack = () => {
    setSubmittedPlaylistId(null);
    setPlaylistIdInput("");
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
            <Box sx={{ flexGrow: 1, borderRadius: '12px', overflow: 'hidden' }}>
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
    </Box>
  );
}