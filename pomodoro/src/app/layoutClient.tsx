// This file contains all the client rendered stuff
'use client';
import { SessionProvider } from 'next-auth/react'
import ThemeRegistry from '@/components/ThemeRegistry'
import CssBaseline from '@mui/material/CssBaseline'
import Navbar from '@/components/Navbar'
import "./globals.css";
import { useEffect, useState } from 'react';

interface RootLayoutClientProps {
  children: React.ReactNode
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ThemeRegistry>
      <SessionProvider refetchOnWindowFocus={false}>
        <CssBaseline />
        <Navbar title="pomoAI" />
        {children}
      </SessionProvider>
    </ThemeRegistry>
  )
}