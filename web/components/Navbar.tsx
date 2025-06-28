"use client";

import SettingsIcon from "@mui/icons-material/Settings";
import { AppBlocking } from "@mui/icons-material";
import Button from "@mui/material/Button";
import UserLogin from "./UserLogin";
import { useState } from "react";
import Settings from "./Settings";
import Link from "next/link";
import "@fontsource/montserrat/200.css";
import { useRouter } from "next/navigation";
import TaskButton from "./TaskButton";

interface NavbarProps {
  title: string;
  titleHref?: string;
}

export default function Navbar({ title, titleHref = "/" }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSettingsOpen = () => setOpen(true);
  const handleSettingsClose = () => setOpen(false);

  return (
    <>
      <div className="flex justify-between ml-5 mr-5 pt-5 items-center">
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


        <div className="flex gap-5">
          <Button
              startIcon={<AppBlocking />}
              sx={{
                fontFamily: "Montserrat, Arial, sans",
                textTransform: "none",
                fontSize: "1.5rem",
                color: "white",
              }}
              onClick={() => router.push("/blocklist")}
            >
              block list
          </Button>

          <TaskButton />

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
