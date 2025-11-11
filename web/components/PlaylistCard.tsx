import { Box, Typography } from "@mui/material";

interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description?: string;
    images?: { url: string }[];
  };
  onClick: (id: string) => void;
}

export default function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  return (
    <Box
      key={playlist.id}
      onClick={() => onClick(playlist.id)}
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
          Array.isArray(playlist.images) && playlist.images.length > 0
            ? playlist.images[0].url
            : ""
        }
        alt={playlist.name}
        width={60}
        height={60}
        style={{ borderRadius: "4px" }}
      />
      <Box>
        <Typography sx={{ fontWeight: "bold" }}>{playlist.name}</Typography>
        {playlist.description && (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {playlist.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
