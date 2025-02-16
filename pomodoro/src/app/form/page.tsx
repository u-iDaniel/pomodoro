"use client";
import { Button } from "@mui/material";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const musicPlaceholder = "ex. relaxing and slow OR emotional OR upbeat";

export default function Page() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    }
  });

  if (status === "loading") {
    return <Suspense fallback="Loading..." />;
  }

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white w-4/5 px-20 py-8 text-black mt-8 flex flex-col gap-4 rounded-lg">
        <h2 className="text-5xl m-auto">personalize your breaks!</h2>
        <p className="text-2xl m-auto">we want to make sure your pomodoro session works for you. customize your break experience that suits your style</p>
        <form className="mt-8 flex flex-col gap-2">
          <label htmlFor="music">describe the music that you enjoy</label>
          <input className="border-2 border-black/75 bg-white text-black" placeholder={musicPlaceholder} type="text" id="music" name="music" />
          <Button 
            variant="contained"
            color="secondary"
            size="medium"
            sx={{
              width: "fit-content",
              m: "auto", 
              paddingX: "4rem", 
              marginTop: "2rem",
              borderRadius: "16px",
              fontWeight: "bold",
            }}
          >
            submit
          </Button>
        </form>
      </div>
    </div>
  );
}

