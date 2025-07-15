"use client";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Avatar, Menu, MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserLogin() {
  const { data: session } = useSession();

  const router = useRouter();
  const handleLogin = () => {
    router.push("/login");
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const handleEditPreferences = () => {
  //   router.push("/form");
  //   handleClose();
  // };

  const handleSignOut = () => {
    signOut();
    handleClose();
  };

  const handlePricing = () => {
    router.push("/pricing");
    handleClose();
  };

  return session ? (
    <>
      <div className="flex items-center gap-4">
        <p>{session.user?.name}</p>
        <Avatar
          src={session.user?.image ?? undefined}
          alt={session.user?.name ?? "User avatar"}
          onClick={handleClick}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        />
      </div>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {/* <MenuItem onClick={handleEditPreferences}>edit preferences</MenuItem> */}
        <MenuItem onClick={handlePricing}>pricing</MenuItem>
        <MenuItem onClick={handleSignOut}>sign out</MenuItem>
      </Menu>
    </>
  ) : (
    <Button
      onClick={handleLogin}
      startIcon={<AccountCircleIcon />}
      sx={{
        fontFamily: "Montserrat, Arial, sans",
        textTransform: "none",
        fontSize: "1.5rem",
        color: "white",
      }}
    >
      login/register
    </Button>
  );
}
