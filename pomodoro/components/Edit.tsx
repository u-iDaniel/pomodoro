"use client";

import { FC, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import "@fontsource/montserrat/200.css";

import TextField from "@mui/material/TextField";

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  taskID: number;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

const Edit: FC<DialogComponentProps> = ({
  open,
  onClose,
  taskID,
  setTasks,
}) => {
  const [newEditTask, setNewEditTask] = useState("");
  const [editNumPomodoros, setEditNumPomodoros] = useState("1");

  const saveEdit = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskID
          ? {
              ...task,
              text: newEditTask.trim(),
              completed: false,
              numPomodoro: Number(editNumPomodoros),
            }
          : task
      )
    );

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogActions sx={{ backgroundColor: "white", color: "#000000" }}>
        <Button onClick={onClose}>
          <CloseIcon sx={{ color: "black" }} />
        </Button>
      </DialogActions>

      <DialogTitle
        sx={{
          textAlign: "center",
          backgroundColor: "white",
          color: "#000000",
          padding: "0px",
        }}
      >
        edit task
      </DialogTitle>
      <Divider />
      <DialogContent
        sx={{ backgroundColor: "white", color: "#000000", width: "32rem" }}
      >
        <Box>
          <div className="flex justify-center items-center gap-5">
            <span>task:</span>
            <TextField
              type="text"
              variant="filled"
              value={newEditTask}
              autoComplete="off"
              onChange={(e) => {
                setNewEditTask(e.target.value);
              }}
              sx={{
                width: "400px",
                "& .MuiFilledInput-root": {
                  backgroundColor: "#E5E5E5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  "&:after": {
                    borderBottom: "2px solid #2697A3",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#000000",
                  padding: "14px 14px",
                },
              }}
            />
            <span>pomodoros:</span>
            <TextField
              type="text"
              variant="filled"
              value={editNumPomodoros}
              autoComplete="off"
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  setEditNumPomodoros(val);
                }
              }}
              onBlur={() => {
                if (
                  editNumPomodoros === "" ||
                  isNaN(Number(editNumPomodoros))
                ) {
                  setEditNumPomodoros("1");
                } else {
                  setEditNumPomodoros(editNumPomodoros);
                }
              }}
              sx={{
                width: "100px",
                "& .MuiFilledInput-root": {
                  backgroundColor: "#E5E5E5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  "&:after": {
                    borderBottom: "2px solid #2697A3",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#000000",
                  padding: "14px 14px",
                },
              }}
            />
          </div>
        </Box>

        <DialogActions>
          <button
            onClick={saveEdit}
            className="p-2 border border-black rounded-2xl"
          >
            save
          </button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default Edit;
