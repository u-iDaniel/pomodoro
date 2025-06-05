"use client";

import SettingsIcon from "@mui/icons-material/Settings";
import Button from "@mui/material/Button";
import UserLogin from "./UserLogin";
import { useState } from "react";
import Settings from "./Settings";
import Link from "next/link";
import "@fontsource/montserrat/200.css";
import styles from "./Navbar_style.module.css";

interface NavbarProps {
  title: string;
  titleHref?: string;
}

export default function Navbar({ title, titleHref = "/" }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const handleSettingsOpen = () => setOpen(true);
  const handleSettingsClose = () => setOpen(false);

  return (
    <>
      <div className={styles.navBar}>
        <div className="home">
          <Link
            href={titleHref}
            style={{
              fontFamily: "Montserrat, Arial, sans",
              fontSize: "48px",
              color: "white",
            }}
          >
            {title}
          </Link>
        </div>

        <div className={styles.navElements}>
          <Button
            startIcon={<SettingsIcon />}
            sx={{
              fontFamily: "Montserrat, Arial, sans",
              textTransform: "none",
              fontSize: "1.5rem",
              color: "white",
            }}
            onClick={handleSettingsOpen}
          >
            settings
          </Button>

          <UserLogin />
        </div>
      </div>

      {/* Settings Dialog */}
      <Settings open={open} onClose={handleSettingsClose} />
    </>
  );
}
