"use client";
import * as React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  Fade,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function BlockList() {
  const { data: session } = useSession();
  const [blockedSites, setBlockedSites] = useState<string[]>(() => {
    if (typeof window !== "undefined" && session?.user?.isMember) {
      const savedSites = localStorage.getItem("blockedSites");
      return savedSites ? JSON.parse(savedSites) : [];
    } else if (typeof window !== "undefined" && !session?.user?.isMember) {
      const savedSites = localStorage.getItem("blockedSites");
      return savedSites ? JSON.parse(savedSites).slice(0, 3) : [];
    }
    return [];
  });

  const [newSite, setNewSite] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blockedSites", JSON.stringify(blockedSites));
      window.postMessage({
        type: "BLOCKED_SITES_UPDATE",
        blockedSites: blockedSites,
      });
    }
  }, [blockedSites]);

  const handleAddSite = () => {
    if (!session?.user?.isMember && blockedSites.length >= 3) {
      alert("become a member to block more than 3 websites!");
      return;
    }

    if (newSite.trim() !== "" && !blockedSites.includes(newSite.trim())) {
      setBlockedSites([...blockedSites, newSite.trim()]);
      setNewSite("");
    }
  };

  const handleRemoveSite = (siteToRemove: string) => {
    setBlockedSites(blockedSites.filter((site) => site !== siteToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSite();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 600,
        bgcolor: "rgba(0, 0, 0, 0.15)",
        color: "white",
        borderRadius: "20px",
        boxShadow: 3,
        p: 3,
        mx: "auto",
        fontFamily: "Montserrat, Arial, sans-serif",
        transition: "all 0.3s ease-in-out",
        mt: 4, // match spacing above TaskList
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        marginBottom="1rem"
        paddingTop="0.5rem"
      >
        block distracting websites
      </Typography>

      <Divider sx={{ backgroundColor: "white", mb: 2 }} />

      <Typography variant="body2" sx={{ color: "white", mb: 2 }}>
        add websites you find distracting to this list. they will be blocked
        during your pomodoro sessions. note that you will need the <a className="text-green-300 underline" href="https://chromewebstore.google.com/detail/pomoai-companion/plbflibgkoljgkhknkafeofjjnllpelc" target="_blank" rel="noopener noreferrer">chrome extension </a>
        installed for this to work.
      </Typography>
      {!session?.user?.isMember && (
        <Typography variant="body2" sx={{ mb: 2, color: "#00FF37" }}>
          you can block up to 3 websites as a free user.{" "}
          <Link href={"/pricing"} className="underline">
            become a member
          </Link>{" "}
          to block more!
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 3,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TextField
          label="enter website"
          variant="outlined"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          onKeyDown={handleKeyPress}
          autoComplete="off"
          fullWidth
          size="small"
          InputLabelProps={{
            style: { color: "rgba(255, 255, 255, 0.6)" },
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
          onClick={handleAddSite}
          sx={{
            color: "white",
            borderColor: "white",
            border: "2px solid white",
            fontWeight: "bold",
            fontFamily: "Montserrat, Arial, sans-serif",
            borderRadius: "16px",
            px: 3,
            py: 1,
            textTransform: "none",
            whiteSpace: "nowrap",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          add
        </Button>
      </Box>

      <Typography
        variant="h6"
        fontWeight="bold"
        marginBottom="1rem"
        paddingTop="0.5rem"
      >
        your blocked websites
      </Typography>

      <Divider sx={{ backgroundColor: "white", mb: 2 }} />

      <Box>
        {blockedSites.length > 0 ? (
          blockedSites.map((site) => (
            <Fade in key={site}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "12px",
                  backgroundColor: "rgba(38, 151, 163, 0.12)",
                  border: "1px solid white",
                  color: "white",
                  fontWeight: 500,
                  userSelect: "none",
                  wordBreak: "break-word",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Montserrat, Arial, sans-serif",
                    maxWidth: "calc(100% - 56px)",
                  }}
                >
                  {site}
                </Typography>
                <IconButton
                  onClick={() => handleRemoveSite(site)}
                  sx={{
                    color: "white",
                    border: "2px solid white",
                    borderRadius: "12px",
                    ml: 2,
                    transition:
                      "transform 0.2s ease, color 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      color: "#FF5555",
                      borderColor: "#FF5555",
                      transform: "scale(1.05)",
                    },
                  }}
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            </Fade>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              opacity: 0.6,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            no websites are currently blocked
          </Typography>
        )}
      </Box>
    </Box>
  );
}
