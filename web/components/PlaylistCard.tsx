import { Box, IconButton, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description?: string;
    images?: { url: string }[];
  };
  onClick: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function PlaylistCard({ playlist, onClick, onDelete }: PlaylistCardProps) {
  return (
    <Box
      key={playlist.id}
      onClick={() => onClick(playlist.id)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1,
        pr: onDelete ? 6 : 1,
        position: "relative",
        borderRadius: "8px",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "& .playlist-delete-button": {
            opacity: 1,
            pointerEvents: "auto",
          },
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
      {onDelete && (
        <IconButton
          className="playlist-delete-button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(playlist.id);
          }}
          aria-label={`Delete ${playlist.name}`}
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(255, 255, 255, 0.8)",
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 0.2s ease",
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
