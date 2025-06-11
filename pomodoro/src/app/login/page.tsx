"use client";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "@fontsource/montserrat/";
import "@fontsource/montserrat/300.css";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.isNewUser) {
        router.push("/form"); // Redirect new users to /form
      } else {
        router.push("/"); // Redirect existing users to /
      }
    }
  }, [session, status, router]);

  return (
    <div className="mt-12 flex items-center justify-center">
      <div className="bg-white w-1/5 h-[400px] flex flex-col items-center p-8 rounded-lg">
        <h2 className="font-montserrat font-light text-4xl text-black">
          sign in
        </h2>
        <div className="w-full flex justify-center m-auto">
          <button
            onClick={() => signIn("google")}
            className="rounded-[20px] bg-transparent border border-black px-5 py-2 text-black font-light font-montserrat"
          >
            sign in with google <GoogleIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
