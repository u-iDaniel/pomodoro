"use client";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import React from "react";

export default function FormComponent() {
  const router = useRouter();
  const [preferenceDetail, setPreferenceDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferenceType: "music",
          preferenceDetail,
        }),
      });

      if (res.ok) {
        setPreferenceDetail(""); // Reset input
        router.push("/"); // Redirect to home page
        router.refresh(); // Refresh the page to update any server components
      } else {
        alert("Error saving preference");
      }
    } catch (error) {
      console.error("Error saving preference:", error);
      alert("Error saving preference");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white w-4/5 px-20 py-8 text-black mt-8 flex flex-col gap-4 rounded-lg">
        <h2 className="text-5xl m-auto">personalize your breaks!</h2>
        <p className="text-2xl m-auto">
          we want to make sure your pomodoro session works for you. customize
          your break experience that suits your style.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-2">
          <label htmlFor="music">describe the music that you enjoy</label>
          <input
            required
            value={preferenceDetail}
            onChange={(e) => setPreferenceDetail(e.target.value)}
            className="border-2 border-black/75 bg-white text-black"
            placeholder="ex. relaxing and slow OR emotional OR upbeat"
            type="text"
            id="music"
            name="music"
          />
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
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
}
