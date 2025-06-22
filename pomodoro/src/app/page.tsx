"use client";

import Timer from "../../components/Timer";
import TaskListDisplay from "../../components/TaskListDisplay";
import { useState } from "react";

export default function Home() {
  const [pressed, setPressed] = useState(false);
  const [open, setOpen] = useState(false);

  const toggleTask = () => {
    setPressed(!pressed);
    setOpen(!open);
  };

  return (
    <div
      style={{
        height: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <main>
        <div className="relative w-full h-full overflow-hidden">
          <Timer />
          <div
            className={`
      absolute top-0 right-5 h-full
      transition-transform duration-300 ease-in-out
      w-[300px]
      ${open ? "translate-x-0" : "translate-x-[calc(100%+1.25rem)]"}
    `}
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
        </div>
      </main>
    </div>
  );
}
