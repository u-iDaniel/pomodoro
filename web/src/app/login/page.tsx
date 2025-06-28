"use client";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="mt-12 flex items-center justify-center ">
      <div className="bg-white w-2/5 h-[400px] flex flex-col items-center p-8 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold text-black">sign in</h2>
        <div className="w-full flex justify-center m-auto">
          <Button 
            type="submit"
            variant="contained"
            size="large"
            color="secondary"
            endIcon={<GoogleIcon />}
            onClick={() => signIn("google")}
          >
            sign in with google
          </Button>
        </div>
      </div>
    </div>
  );
}