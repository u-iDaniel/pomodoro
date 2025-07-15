"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionUpdater() {
  const { update } = useSession();

  useEffect(() => {
    // This will trigger a session update when the component mounts
    (async () => await update())();
  }, []);

  return null; // This component does not render anything
}