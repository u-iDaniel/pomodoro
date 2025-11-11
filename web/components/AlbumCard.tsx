import { Box, Typography } from "@mui/material";

interface AlbumCardProps {
  album: {
    id: string;
    name: string;
    popularity: number;
    release_date: string; // YYYY or YYYY-MM or YYYY-MM-DD
    images: { url: string }[];
    artists: { name: string }[];
  };
  onClick: (id: string) => void;
}

export default function AlbumCard({ album, onClick }: AlbumCardProps) {
  const year = album.release_date
    ? new Date(album.release_date).getFullYear() || album.release_date
    : undefined;

  return (
    <Box
      key={album.id}
      onClick={() => onClick(album.id)}
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
          Array.isArray(album.images) && album.images.length > 0
            ? album.images[0].url // fetches the largest image since Spotify API returns images sorted from largest to smallest
            : ""
        }
        alt={album.name}
        width={75}
        height={75}
        style={{ borderRadius: "4px" }}
      />
      <Box>
        <Typography sx={{ fontWeight: "bold" }}>
          {album.name} {year ? `(${year})` : ""}
        </Typography>
        {Array.isArray(album.artists) && album.artists.length > 0 && (
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {album.artists.map(artist => artist.name).join(", ")}
          </Typography>
        )}
        {typeof album.popularity === "number" && (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            popularity: {album.popularity}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
