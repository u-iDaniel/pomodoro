"use client";
import MusicPlayer from "@/components/MusicPlayer";
import TaskListDisplay from "@/components/TaskListDisplay";
import Timer from "@/components/Timer";
import { useSession } from "next-auth/react";

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
        </div>
      </main>
      <div className="absolute top-[15%] right-5 w-[30%]">
        <TaskListDisplay />
      </div>

      <div className="w-[30%]">
        {session?.user ? (
          <div>
            <MusicPlayer />
          </div>
        ) : (
          <div className="absolute bottom-[30%]">
            {/* want AI personalized break recommendations?{" "}
            <Link className="underline" href={"/login"}>
              sign up
            </Link> */}
          </div>
        )}
      </div>
    </div>
  );
}
