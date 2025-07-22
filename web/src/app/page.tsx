"use client";
import MusicPlayer from "@/components/MusicPlayer";
import TaskListDisplay from "@/components/TaskListDisplay";
import Timer from "@/components/Timer";
import { useSession } from "next-auth/react";
import { Link } from "@mui/material";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div
      style={{
        height: "calc(100vh - 200px)",
      }}
    >
      <main
        style={{
          height: "calc(100vh - 200px)",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "50px",
        }}
      >
        <div>
          <Timer />
          {!session?.user ? (
            <div className="mt-10 text-center text-white">
              want access to premium features like AI and music?{" "}
              <Link
                className="underline text-white decoration-white"
                href={"/login"}
              >
                sign up
              </Link>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </main>
      <div className="absolute top-[20%] right-5 w-[30%]">
        <TaskListDisplay />
      </div>

      {session?.user ? (
        <div className="absolute top-[20%] left-5 w-[30%]">
          <MusicPlayer />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
