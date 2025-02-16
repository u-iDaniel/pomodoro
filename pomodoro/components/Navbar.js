"use client"; 

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import Button from '@mui/material/Button';
import UserLogin from './UserLogin';

import "@fontsource/montserrat";

export default function Navbar({title}) {

  return <AppBar position="static" sx={{ backgroundColor: "white", color: "black", }} >
    <Toolbar sx={{mt: 2, mb: 2}}>    
      <Typography
        variant="h3"
        component="div"
        sx={{fontWeight: 700, fontFamily: 'Montserrat, Arial, sans'}}

      >
        {title}
      </Typography>

  
       <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: "auto"}}>
          {/* Settings Button with Icon */}
          <Button color="inherit" startIcon={<SettingsIcon />} 
          sx={{fontFamily: 'Montserrat, Arial, sans', textTransform: 'none', fontSize: '1.5rem'}}>
            settings
          </Button>
          <UserLogin />
        </Box>
    </Toolbar>
  </AppBar>
}