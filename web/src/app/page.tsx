"use client";
import MusicPlayer from "@/components/MusicPlayer";
import TaskListDisplay from "@/components/TaskListDisplay";
import Timer from "@/components/Timer";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const toggleTask = () => {
    setOpen(!open);
  };
  
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
        <div className="relative">
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
        <div
          className={`absolute top-1/3 right-0 h-full transition-transform duration-300 ease-in-out w-[300px] ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <TaskListDisplay />
          <button
            onClick={toggleTask}
            style={{
              borderTopLeftRadius: "20px",
              borderBottomLeftRadius: "20px",
              backgroundColor: "transparent",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "white",
              padding: "10px 20px",
              color: "white",
              fontFamily: "Montserrat, Arial, sans",
              fontWeight: "200",
              position: "absolute",
              top: "0",
              left: "-100px",
            }}
          >
            tasks
          </button>
        </div>
      </main>
    </div>
  );
}
