"use client";
import MusicPlayer from "@/components/MusicPlayer";
import Timer from "@/components/Timer";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div
      style={{
        height: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <main>
        <div style={{ position: "relative" }}>
          <Timer />

          {session?.user ? (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginTop: "50px",
              }}
            >
              <MusicPlayer />
            </div>
          ) : (
            <div className="text-center mt-10">
              want AI personalized break recommendations?{" "}
              <Link className="underline" href={"/login"}>
                sign up
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
