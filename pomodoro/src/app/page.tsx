"use client";

import Timer from "../../components/Timer";

export default function Home() {
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
        <Timer />
      </main>
    </div>
  );
}
