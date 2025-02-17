"use client"; 

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from '@mui/material/Button';
import UserLogin from './UserLogin';
import { useState } from 'react';
import Dialog from './Dialog'; 
import Link from 'next/link';
import MuiLink from '@mui/material/Link';

import "@fontsource/montserrat";

interface NavbarProps {
  title: string;
  titleHref?: string;
  onSettingsSave: (pomodoro: number, shortBreak: number, longBreak: number) => void;
}

export default function Navbar({ title, titleHref = "/", onSettingsSave }: NavbarProps) {
  const [openSettings, setOpenSettings] = useState(false);

  const handleSettingsOpen = () => setOpenSettings(true);
  const handleSettingsClose = () => setOpenSettings(false);

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "white", color: "black" }}>
        <Toolbar sx={{ mt: 2, mb: 2 }}>    
          {/* Title as a Link */}
          <Typography
            variant="h3"
            component="div"
            sx={{ fontWeight: 700, fontFamily: 'Montserrat, Arial, sans' }}
          >
            <Link href={titleHref} style={{ textDecoration: "none", color: "inherit" }}>
            
                {title}
             
            </Link>
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: "auto" }}>
            {/* Settings Button with Icon */}
            <Button 
              color="inherit" 
              startIcon={<SettingsIcon />} 
              sx={{ fontFamily: 'Montserrat, Arial, sans', textTransform: 'none', fontSize: '1.5rem' }}
              onClick={handleSettingsOpen}
            >
              settings
            </Button>
            <UserLogin />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Settings Dialog */}
      <Dialog
        open={openSettings}
        onClose={handleSettingsClose}
        onSave={(pomodoro, shortBreak, longBreak) => onSettingsSave(pomodoro, shortBreak, longBreak)}
      />
    </>
  );
}
