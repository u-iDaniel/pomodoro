"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Divider,
  Button,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import Edit from "../components/Edit";
import Generate from "../components/Generate";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (!session?.user) {
      const stored = localStorage.getItem("tasks");
      return stored ? JSON.parse(stored) : [];
    } else {
      return [];
    }
  });
  const [newTask, setNewTask] = useState("");
  const [numPomodoros, setNumPomodoros] = useState("1");
  const [editTaskID, setEditTaskID] = useState(0);

  const [open, setOpen] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const handleAIOpen = () => {
    if (!session?.user) {
      redirect("/login");
    }
    setOpenAI(true);
  };

  const handleAIClose = () => setOpenAI(false);
  const handleEditOpen = (taskID: number) => {
    setEditTaskID(taskID);
    setOpen(true);
  };
  const handleEditClose = () => setOpen(false);

  const addTask = () => {
    if (newTask === "") return;
    const new_id = Date.now();
    const new_text = newTask.trim();
    const new_completed = false;
    const new_numPomodoro = Number(numPomodoros);

    setTasks((prev) => [
      ...prev,
      {
        id: new_id,
        text: new_text,
        completed: new_completed,
        numPomodoro: new_numPomodoro,
      },
    ]);
    saveTask({
      id: new_id,
      text: new_text,
      completed: new_completed,
      numPomodoro: new_numPomodoro,
    });
    setNewTask("");
  };

  const clearTask = (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    deleteTask(task);
  };

  const clearAllTasks = () => {
    setTasks([]);
    deleteAllTasks();
  };

  const setCompleted = (user_task: Task) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === user_task.id
          ? { ...task, completed: !user_task.completed }
          : task
      )
    );
    saveCompleted({ ...user_task, completed: !user_task.completed });
  };

  useEffect(() => {
    if (!session?.user) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (session?.user) await loadData();
    };
    fetchTasks();
  }, [session]);

  const saveTask = async (task: Task) => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, userid: session.user.id }),
      });
      if (!res.ok) alert("Error saving task");
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error saving task");
    }
  };

  const deleteTask = async (task: Task) => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, userid: session.user.id }),
      });
      if (!res.ok) alert("Error deleting task");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task");
    }
  };

  const deleteAllTasks = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: session.user.id }),
      });
      if (!res.ok) alert("Error deleting all tasks");
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      alert("Error deleting all tasks");
    }
  };

  const saveCompleted = async (task: Task) => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, userid: session.user.id }),
      });
      if (!res.ok) alert("Error editing task");
    } catch (error) {
      console.error("Error editing task:", error);
      alert("Error editing task");
    }
  };

  const loadData = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) alert("Error loading tasks");
      else {
        const data = await res.json();
        setTasks(data.task_list);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      alert("Error loading tasks");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        backgroundColor: "#1E7D87",
        boxShadow: 3,
        borderRadius: "20px",
        color: "white",
        fontFamily: "Montserrat, Arial, sans",
        display: "flex",
        flexDirection: "column",
        p: 3,
        mt: 4,
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={1}>
        add tasks
      </Typography>
      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)", mb: 2 }} />
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <TextField
          label="Task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          fullWidth
          autoComplete="off"
          sx={{
            input: { color: "white" },
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "#1DB954" },
            },
            "& label": { color: "white" },
          }}
        />
        <TextField
          label="Pomodoros"
          value={numPomodoros}
          autoComplete="off"
          onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
          }}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*\.?\d*$/.test(val)) setNumPomodoros(val);
          }}
          onBlur={() => {
            if (numPomodoros === "" || isNaN(Number(numPomodoros))) {
              setNumPomodoros("1");
            }
          }}
          sx={{
            width: "120px",
            input: { color: "white" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "#1DB954" },
            },
            "& label": { color: "white" },
          }}
        />
        <Button
          variant="outlined"
          onClick={addTask}
          sx={{
            color: "white",
            borderColor: "white",
            fontWeight: "bold",
            borderRadius: "50px",
            textTransform: "none",
            "&:hover": {
              borderColor: "#1DB954",
              color: "#1DB954",
            },
          }}
        >
          add
        </Button>
      </Box>
      <Typography align="center" variant="body2" mb={2}>
        or
      </Typography>
      <Button
        onClick={handleAIOpen}
        sx={{
          background: "linear-gradient(to right, #00d4ff, #90f7ec)",
          color: "black",
          fontWeight: "bold",
          borderRadius: "16px",
          textTransform: "none",
          px: 4,
          py: 1.5,
          boxShadow: "0px 0px 10px rgba(0,212,255,0.4)",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0px 0px 20px rgba(0,212,255,0.6)",
          },
        }}
      >
        ✨ generate with AI
      </Button>

      <Typography variant="h6" fontWeight="bold" mt={4} mb={2}>
        your tasks
      </Typography>
      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)", mb: 2 }} />
      <Box sx={{ maxHeight: "50vh", overflowY: "auto" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "12px",
                backgroundColor: "rgba(38, 151, 163, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                textAlign: "center",
              }}
            >
              <div style={{ fontWeight: 500 }}>{task.text}</div>
              <div style={{ fontSize: "0.9rem", marginTop: 4 }}>
                pomodoros: {task.numPomodoro}
              </div>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 1,
                }}
              >
                <IconButton
                  onClick={() => setCompleted(task)}
                  sx={{
                    borderRadius: "1rem",
                    border: "2px solid",
                    borderColor: task.completed ? "#00FF37" : "white",
                    color: task.completed ? "#00FF37" : "white",
                    transition: "0.3s ease",
                  }}
                >
                  <CheckIcon />
                </IconButton>
                <Button
                  onClick={() => handleEditOpen(task.id)}
                  variant="outlined"
                  sx={{
                    color: "white",
                    borderColor: "white",
                    borderRadius: "16px",
                    textTransform: "none",
                    "&:hover": {
                      color: "#1DB954",
                      borderColor: "#1DB954",
                    },
                  }}
                >
                  edit
                </Button>
                <IconButton
                  onClick={() => clearTask(task)}
                  sx={{
                    borderRadius: "16px",
                    color: "white",
                    border: "2px solid white",
                    "&:hover": {
                      color: "#FF5555",
                      borderColor: "#FF5555",
                    },
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            </li>
          ))}
        </ul>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="outlined"
          onClick={clearAllTasks}
          sx={{
            color: "white",
            borderColor: "white",
            borderRadius: "50px",
            textTransform: "none",
            "&:hover": {
              borderColor: "#FF5555",
              color: "#FF5555",
            },
          }}
        >
          clear list
        </Button>
      </Box>
      <Edit
        open={open}
        onClose={handleEditClose}
        taskID={editTaskID}
        setTasks={setTasks}
        tasks={tasks}
      />
      <Generate open={openAI} onClose={handleAIClose} setTasks={setTasks} />
    </Box>
  );
}
