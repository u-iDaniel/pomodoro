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
import PlaylistCard from "./PlaylistCard";
import AlbumCard from "./AlbumCard";

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
}

interface Album {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
  popularity: number;
  artists: { name: string }[];
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
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [isPlaylist, setIsPlaylist] = useState<boolean>(true); // determine if user wants playlist or album

  useEffect(() => {
    const storedPlaylists = localStorage.getItem("recentPlaylists");
    if (storedPlaylists) {
      setRecentPlaylists(JSON.parse(storedPlaylists));
    }
    const storedAlbums = localStorage.getItem("recentAlbums");
    if (storedAlbums) {
      setRecentAlbums(JSON.parse(storedAlbums));
    }
  }, []);

  // Accept both playlist and album URLs or raw IDs
  const extractSpotifyId = (input: string): string | null => {
    try {
      if (input.startsWith("https://open.spotify.com/")) {
        const url = new URL(input);
        // pathname removes domain and query params
        const pathParts = url.pathname.split("/").filter(Boolean); // .filter removes empty strings
        // /playlist/{id} or /album/{id}
        const id = pathParts[pathParts.length - 1];
        return id;
      }
      // Assuming it's a raw ID if not a URL
      return input;
    } catch {
      return null;
    }
  };

  const handlePlaylistSubmit = async () => {
    const id = extractSpotifyId(playlistIdInput.trim());
    if (id) {
      try {
        const response = await fetch(`/api/spotify/playlist/${id}`);
        if (!response.ok) {
          throw new Error("Playlist not found");
        }
        const playlistData = await response.json();

        if (playlistData.notFound) {
          alert(
            "The playlist was potentially not found. If it was a Spotify account playlist, it should still work."
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

  const handleAlbumSubmit = async () => {
    const id = extractSpotifyId(playlistIdInput.trim());
    if (id) {
      try {
        const response = await fetch(`/api/spotify/album/${id}`);
        if (!response.ok) {
          throw new Error("Album not found");
        }
        const albumData = await response.json();
        if (albumData.notFound) {
          alert("The album was potentially not found.");
          setSubmittedPlaylistId(id);
        } else {
          setSubmittedPlaylistId(id);
          const newRecentAlbums = [
            albumData,
            ...recentAlbums.filter((a) => a.id !== id),
          ].slice(0, 5);
          setRecentAlbums(newRecentAlbums);
          localStorage.setItem("recentAlbums", JSON.stringify(newRecentAlbums));
        }
      } catch {
        alert("Invalid Spotify Album URL or ID");
      }
    } else {
      alert("Invalid Spotify Album URL or ID");
    }
  };

  const handleBack = () => {
    setSubmittedPlaylistId(null);
    setPlaylistIdInput("");
  };

  const handleRecentPlaylistClick = (id: string) => {
    setIsPlaylist(true);
    setSubmittedPlaylistId(id);
  };

  const handleRecentAlbumClick = (id: string) => {
    setIsPlaylist(false);
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
                    connected {isPlaylist ? " playlist" : " album"}
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
                    src={`https://open.spotify.com/embed/${isPlaylist ? "playlist" : "album"}/${submittedPlaylistId}?theme=0&limit=10000`}
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
                <Box sx={{ width: "100%", mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 2 }}>
                    <button
                      onClick={() => setIsPlaylist(true)}
                      style={{
                        borderRadius: "20px",
                        backgroundColor: "transparent",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: isPlaylist ? "#00FF37" : "white",
                        padding: "10px 20px",
                        color: isPlaylist ? "#00FF37" : "white",
                        transition:
                          "border-color 0.4s ease, color 0.4s ease",
                        fontFamily: "Montserrat, Arial, sans",
                        fontWeight: "200",
                      }}
                    >
                      playlist
                    </button>
                    <button
                      onClick={() => setIsPlaylist(false)}
                      style={{
                        borderRadius: "20px",
                        backgroundColor: "transparent",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: !isPlaylist ? "#ff5100" : "white",
                        padding: "10px 20px",
                        color: !isPlaylist ? "#ff5100" : "white",
                        transition:
                          "border-color 0.4s ease, color 0.4s ease",
                        fontFamily: "Montserrat, Arial, sans",
                        fontWeight: "200",
                      }}
                    >
                      album
                    </button>
                  </Box>

                  {isPlaylist && recentPlaylists.length > 0 && (
                    <Box>
                      {recentPlaylists.map((playlist) => (
                        <PlaylistCard
                          key={playlist.id}
                          playlist={playlist}
                          onClick={handleRecentPlaylistClick}
                        />
                      ))}
                    </Box>
                  )}

                  {!isPlaylist && recentAlbums.length > 0 && (
                    <Box>
                      {recentAlbums.map((album) => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          onClick={handleRecentAlbumClick}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
                <Typography>
                  {isPlaylist
                    ? "enter a public spotify playlist id or url (on the spotify app, go to share -> copy link to playlist)"
                    : "enter a spotify album id or url (on the spotify app, go to share -> copy link to album)"}
                </Typography>
                <TextField
                  label={isPlaylist ? "playlist ID or URL" : "album ID or URL"}
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
                  onClick={isPlaylist ? handlePlaylistSubmit : handleAlbumSubmit}
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
                  {isPlaylist ? "connect playlist" : "connect album"}
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
