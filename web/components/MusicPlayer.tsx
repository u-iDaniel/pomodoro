import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Collapse,
} from "@mui/material";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
}

export default function MusicPlayer() {
  const { data: session } = useSession();
  const router = useRouter();
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
        const pathParts = url.pathname.split("/");
        return pathParts[pathParts.length - 1];
      }
      // Assuming it's a raw ID if not a URL
      return input;
    } catch {
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
      } catch {
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
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        borderRadius: "20px",
        p: 3,
        color: "white",
        fontFamily: "Montserrat, Arial, sans-serif",
        boxShadow: 3,
        transition: "width 0.3s ease",
        transformOrigin: "bottom left",
      }}
    >
      {/* Header with divider */}
      <Box
        onClick={() => setIsCollapsed(!isCollapsed)}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          music player <HeadphonesIcon sx={{ verticalAlign: "middle" }} />
        </Typography>
        <IconButton sx={{ color: "white" }}>
          {isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
      </Box>
      <Collapse in={!isCollapsed} timeout={400} unmountOnExit>
        {session?.user.isMember ? (
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {submittedPlaylistId ? (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Button
                    onClick={handleBack}
                    sx={{ color: "white", minWidth: "auto", p: 1, mr: 1 }}
                    aria-label="Back to playlist input"
                  >
                    ←
                  </Button>
                  <Typography variant="h6" sx={{ color: "white" }}>
                    connected playlist
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    borderRadius: "12px",
                    overflow: "hidden",
                    height: "600px",
                  }}
                >
                  <iframe
                    src={`https://open.spotify.com/embed/playlist/${submittedPlaylistId}?theme=0`}
                    width="100%"
                    height="100%"
                    allowFullScreen
                    allow="autoplay; encrypted-media; clipboard-write"
                    loading="lazy"
                    style={{ borderRadius: "12px" }}
                    title="Spotify Playlist"
                  />
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "90%",
                  alignItems: "center",
                  pb: 2,
                }}
              >
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
                          src={
                            Array.isArray(playlist.images) &&
                            playlist.images.length > 0
                              ? playlist.images[0].url
                              : ""
                          }
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
                <Typography sx={{ textAlign: "center" }}>
                  enter a public Spotify playlist id or url (on the spotify app,
                  go to share -{">"} copy link to playlist)
                </Typography>
                <TextField
                  label="playlist ID or URL"
                  variant="outlined"
                  value={playlistIdInput}
                  onChange={(e) => setPlaylistIdInput(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    style: {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  sx={{
                    input: { color: "white" },
                    "& .MuiOutlinedInput-root": {
                      fontFamily: "Montserrat, Arial, sans-serif",
                      borderRadius: "16px",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "white",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                      },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleSubmit}
                  sx={{
                    color: "white",
                    borderColor: "white",
                    border: "2px solid white",
                    fontWeight: "bold",
                    borderRadius: "16px",
                    px: 2,
                    py: 1,
                    textTransform: "none",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      backgroundColor: "transparent",
                    },
                    mt: 2,
                  }}
                >
                  connect playlist
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", color: "white", mt: 2 }}>
            <Typography variant="body1">
              premium members get unlimited access to the music player!
            </Typography>
            <Button
              variant="outlined"
              sx={{
                marginTop: 2,
                color: "white",
                borderColor: "white",
                borderRadius: "16px",
                textTransform: "none",
                fontWeight: "bold",
                borderWidth: 2,
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.05)" },
                minWidth: 64,
                px: 1.5,
              }}
              onClick={() => router.push("/pricing")}
            >
              get premium
            </Button>
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
