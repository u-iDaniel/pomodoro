"use client";
import { signIn } from "next-auth/react";
import { Button } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white w-2/5 h-[400px] flex flex-col items-center justify-center p-8 rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold mb-8 text-black">sign in</h2>
        <form className="w-full flex justify-center" action={() => {
          signIn("google", { callbackUrl: "/" });
        }}>
          <Button 
            type="submit"
            variant="contained"
            size="large"
            color="secondary"
            endIcon={<GoogleIcon />}
          >
            sign in with google
          </Button>
        </form>
      </div>
    </div>
  );
}