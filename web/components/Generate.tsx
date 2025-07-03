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
import { useSession } from "next-auth/react";

import TextField from "@mui/material/TextField";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Generate: FC<DialogComponentProps> = ({ open, onClose, setTasks }) => {
  const { data: session } = useSession();
  const [generateText, setGenerateText] = useState("");
  
  const deleteAllTasks = async () => {
    if (session?.user) {
      try {
        const res = await fetch("/api/tasks", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid: session.user.id,
          }),
        });
  
        if (!res.ok) {
          alert("Error deleting all tasks");
        }
      } catch (error) {
        console.error("Error deleting all tasks:", error);
        alert("Error deleting all tasks");
      }
    }
  };

  const generateResponse = async () => {
    deleteAllTasks();
    try {
      const pomodoroTime = localStorage.getItem("pomodoroTime");
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generateText,
          pomodoroTime,
        }),
      });

      if (!res.ok) {
        alert("Error generating tasks");
      }
      loadData();
    } catch (error) {
      console.error("Error generating tasks:", error);
      alert("Error generating tasks");
    }

    setTimeout(() => {
      onClose();
    }, 10);
  };

  const loadData = async () => {
    if (session?.user) {
      try {
        const res = await fetch("/api/tasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          alert("Error loading tasks");
        } else {
          const data = await res.json();
          setTasks(data.task_list);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
        alert("Error loading tasks");
      }
    }
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
        generate task list
      </DialogTitle>
      <Divider />
      <DialogContent
        sx={{ backgroundColor: "white", color: "#000000", width: "32rem" }}
      >
        <Box className="flex flex-col items-center">
          <div className="flex justify-start w-full">
            <div>describe your project in detail:</div>
          </div>
          <TextField
            multiline
            minRows={8}
            maxRows={15}
            fullWidth
            type="text"
            variant="filled"
            value={generateText}
            autoComplete="off"
            onChange={(e) => {
              setGenerateText(e.target.value);
            }}
            sx={{
              width: "full",
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
        </Box>

        <DialogActions>
          <button
            onClick={generateResponse}
            className="p-2 border-2 border-black rounded-2xl transition duration-200 hover:shadow-lg hover:scale-105"
          >
            generate
          </button>
        </DialogActions>
        <div className="text-center">note: this will delete existing tasks</div>
      </DialogContent>
    </Dialog>
  );
};

export default Generate;
