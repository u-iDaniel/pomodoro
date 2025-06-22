"use client";
import { useState } from "react";
import { Button } from "@mui/material";
import "@fontsource/montserrat/";
import "@fontsource/montserrat/300.css";
import TaskList from "../../../components/TaskList";

export default function Tasks() {
  return (
    <>
      <TaskList />
    </>
  );
}
