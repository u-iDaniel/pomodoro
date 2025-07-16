"use client";

import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Divider,
  Box,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSession } from "next-auth/react";

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  taskID: number;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
  order: number;
}

const Edit: FC<DialogComponentProps> = ({
  open,
  onClose,
  taskID,
  setTasks,
  tasks,
}) => {
  const { data: session } = useSession();
  const [newEditTask, setNewEditTask] = useState("");
  const [editNumPomodoros, setEditNumPomodoros] = useState("1");

  const saveEdit = () => {
    let task_order = -1;
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskID) {
          task_order = task.order;
          return {
            ...task,
            text: newEditTask.trim(),
            completed: false,
            numPomodoro: Number(editNumPomodoros),
          };
        } else {
          return task;
        }
      })
    );

    saveEditData({
      id: taskID,
      text: newEditTask.trim(),
      completed: false,
      numPomodoro: Number(editNumPomodoros),
      order: task_order,
    });
    onClose();
  };

  const saveEditData = async (task: Task) => {
    if (session?.user) {
      try {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: task.id,
            userid: session.user.id,
            text: task.text,
            completed: task.completed,
            numPomodoro: task.numPomodoro,
            order: task.order,
          }),
        });

        if (!res.ok) {
          alert("Error editing task");
        }
      } catch (error) {
        console.error("Error editing task:", error);
        alert("Error editing task");
      }
    }
  };

  useEffect(() => {
    if (open) {
      const task = tasks.find((t) => t.id === taskID);
      if (task) {
        setNewEditTask(task.text);
        setEditNumPomodoros(String(task.numPomodoro));
      }
    }
  }, [open, taskID, tasks]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogActions sx={{ backgroundColor: "white", color: "black" }}>
        <Button onClick={onClose}>
          <CloseIcon sx={{ color: "black" }} />
        </Button>
      </DialogActions>

      <DialogTitle
        sx={{
          textAlign: "center",
          backgroundColor: "white",
          color: "black",
          padding: "0px",
          fontFamily: "Montserrat, Arial, sans-serif",
          fontWeight: "bold",
          fontSize: "1.25rem",
        }}
      >
        edit task
      </DialogTitle>
      <Divider sx={{ backgroundColor: "rgba(0,0,0,0.1)" }} />
      <DialogContent
        sx={{ backgroundColor: "white", color: "black", width: "32rem" }}
      >
        <Box>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
              marginBottom: "1rem",
            }}
          >
            <TextField
              type="text"
              variant="outlined"
              label="task"
              value={newEditTask}
              autoComplete="off"
              onChange={(e) => setNewEditTask(e.target.value)}
              InputLabelProps={{
                style: { color: "rgba(0, 0, 0, 0.6)" },
              }}
              sx={{
                width: "400px",
                fontFamily: "Montserrat, Arial, sans",
                input: { color: "#000000" },
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Montserrat, Arial, sans",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.4)",
                    borderRadius: "16px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000000",
                  },
                },
              }}
              size="small"
            />
            <TextField
              type="text"
              variant="outlined"
              label="pomodoros"
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
                }
              }}
              InputLabelProps={{
                style: { color: "rgba(0, 0, 0, 0.6)" },
              }}
              sx={{
                width: "150px",
                fontFamily: "Montserrat, Arial, sans",
                input: { color: "#000000" },
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Montserrat, Arial, sans",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.4)",
                    borderRadius: "16px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000000",
                  },
                },
              }}
              size="small"
            />
          </div>
        </Box>

        <DialogActions sx={{ justifyContent: "flex-end" }}>
          <Button
            onClick={saveEdit}
            variant="outlined"
            sx={{
              px: 2,
              py: 1,
              borderWidth: "2px",
              borderColor: "black",
              color: "black",
              fontWeight: "bold",
              backgroundColor: "white",
              borderRadius: "1rem",
              textTransform: "none",
              width: 120,
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "white",
                borderColor: "black",
                transform: "scale(1.05)",
              },
            }}
          >
            save
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default Edit;
