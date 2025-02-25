"use client";

import { FC, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import TextField from '@mui/material/TextField';

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  onSave?: (pomodoro: number, shortBreak: number, longBreak: number) => void;
}

const DialogComponent: FC<DialogComponentProps> = ({ open, onClose, onSave }) => {
    const [pomodoro, setPomodoro] = useState(() => {
      const stored = localStorage.getItem("pomodoroTime");
      return stored ? String(Math.floor(Number(stored) / 60)) : "25";
    });
    
    const [shortBreak, setShortBreak] = useState(() => {
      const stored = localStorage.getItem("shortBreakTime");
      return stored ? String(Math.floor(Number(stored) / 60)) : "5";
    });
    
    const [longBreak, setLongBreak] = useState(() => {
      const stored = localStorage.getItem("longBreakTime");
      return stored ? String(Math.floor(Number(stored) / 60)) : "15";
    });
  
    const handleSave = () => {
      const pomodoroNum = Number(pomodoro);
      const shortBreakNum = Number(shortBreak);
      const longBreakNum = Number(longBreak);
  
      // Store values in minutes in localStorage
      localStorage.setItem("pomodoroTime", String(pomodoroNum * 60));
      localStorage.setItem("shortBreakTime", String(shortBreakNum * 60));
      localStorage.setItem("longBreakTime", String(longBreakNum * 60));
  
      if (onSave) {
        onSave(pomodoroNum, shortBreakNum, longBreakNum);
      }
      onClose();
    };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogActions sx={{backgroundColor: "white", color: "#000000"}}>
        <Button onClick={onClose}>
          <CloseIcon sx={{color: "black"}}/>
        </Button>
      </DialogActions>

      <DialogTitle 
        sx={{textAlign: "center", backgroundColor: "white", color: "#000000"}}
        >
            settings
        </DialogTitle>
       <Divider />
      <DialogContent sx={{backgroundColor: "white", color: "#000000", width: "32rem"}}>
        {/* You can add more settings options here */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto", color:"#8C8C8C"}}>
          <AccessTimeIcon/>
            timer
        </Box>

        <p style={{paddingTop: "1rem", fontSize:"1.25rem"}}>time (minutes)</p>
            <List sx={{display: "flex"}}>
                <ListItem sx={{display: "block", padding: "0"}}>
                    <ListItemText primary="pomodoro"/>
                    <TextField 
                      type='number' 
                      variant='filled' 
                      value={pomodoro}
                      onChange={(e) => setPomodoro(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { color: '#000000' },
                        '& .MuiFilledInput-root': { backgroundColor: '#E5E5E5'},
                        width: "100px"
                      }} 
                    />
                </ListItem>

                <ListItem sx={{display: "block", padding: "0"}}>
                    <ListItemText primary="short break"/>
                    <TextField 
                      type='number' 
                      variant='filled' 
                      value={shortBreak}
                      onChange={(e) => setShortBreak(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { color: '#000000' },
                        '& .MuiFilledInput-root': { backgroundColor: '#E5E5E5'},
                        width: "100px"
                      }} 
                    />
                </ListItem>
                <ListItem sx={{display: "block", padding: "0"}}>
                    <ListItemText primary="long break"/>
                    <TextField 
                      type='number' 
                      variant='filled' 
                      value={longBreak}
                      onChange={(e) => setLongBreak(e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { color: '#000000' },
                        '& .MuiFilledInput-root': { backgroundColor: '#E5E5E5'},
                        width: "100px"
                      }} 
                    />
                </ListItem>
            </List>

            <DialogActions>
                <Button onClick={handleSave} color="primary" variant="contained">
                save
               </Button>
            </DialogActions>
            
      </DialogContent>
    </Dialog>
  );
};

export default DialogComponent;