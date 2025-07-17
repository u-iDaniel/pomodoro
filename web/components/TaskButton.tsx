"use client";

import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import ChecklistIcon from "@mui/icons-material/Checklist";
import React from "react";

export default function TaskButton() {
  const router = useRouter();
  const handleTasks = () => {
    router.push("/tasks");
  };

  return (
    <>
      <Button
        startIcon={<ChecklistIcon />}
        sx={{
          fontFamily: "Montserrat, Arial, sans",
          textTransform: "none",
          fontSize: "1.5rem",
          color: "white",
        }}
        onClick={handleTasks}
      >
        edit tasks
      </Button>
    </>
  );
}
