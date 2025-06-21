"use client";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import ClearIcon from "@mui/icons-material/Clear";
import Edit from "../components/Edit";
import CheckIcon from "@mui/icons-material/Check";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
  });
  const [newTask, setNewTask] = useState("");
  const [numPomodoros, setNumPomodoros] = useState("1");
  const [editTaskID, setEditTaskID] = useState(0);

  const [open, setOpen] = useState(false);

  const handleEditOpen = (taskID: number) => {
    setEditTaskID(taskID);
    setOpen(true);
  };
  const handleEditClose = () => setOpen(false);

  const addTask = () => {
    if (newTask === "") {
      return;
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: newTask.trim(),
          completed: false,
          numPomodoro: Number(numPomodoros),
        },
      ]);
      setNewTask("");
    }
  };

  const clearTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  const setCompleted = (id: number) => {
    setTasks((prev) => {
      return prev.map((task) => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });
    });
  };

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <div className="flex justify-center text-black">
      <div className="bg-gray-100 rounded-lg w-1/3 text-center">
        <div className="text-2xl p-2">add items</div>
        <Divider />
        <div className="p-2">
          <div className="flex justify-center items-center gap-5">
            <span>task:</span>
            <TextField
              type="text"
              variant="filled"
              value={newTask}
              autoComplete="off"
              onChange={(e) => {
                setNewTask(e.target.value);
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
              value={numPomodoros}
              autoComplete="off"
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;

                if (/^\d*\.?\d*$/.test(val)) {
                  setNumPomodoros(val);
                }
              }}
              onBlur={() => {
                if (numPomodoros === "" || isNaN(Number(numPomodoros))) {
                  setNumPomodoros("1");
                } else {
                  setNumPomodoros(numPomodoros);
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
            <button
              onClick={addTask}
              className="p-2 border border-black rounded-2xl"
            >
              add
            </button>
          </div>
          <div className="text-2xl p-2">your tasks:</div>
          <Divider />
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="break-words whitespace-normal">
                <span className="block">{task.text}</span>
                <span className="block">pomodoros: {task.numPomodoro}</span>
                <div className="flex gap-10 justify-center mb-2 mt-2">
                  <button
                    onClick={() => setCompleted(task.id)}
                    style={{
                      borderRadius: "1rem",
                      backgroundColor: "transparent",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      paddingLeft: "0.5rem",
                      paddingRight: "0.5rem",
                      borderColor: task.completed ? "#00FF37" : "grey",
                      color: task.completed ? "#00FF37" : "grey",
                      transition: "border-color 0.4s ease, color 0.4s ease",
                      fontFamily: "Montserrat, Arial, sans",
                      fontWeight: "200",
                    }}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    onClick={() => handleEditOpen(task.id)}
                    className="border border-black rounded-2xl pl-2 pr-2"
                  >
                    edit
                  </button>
                  <button
                    onClick={() => clearTask(task.id)}
                    className="border border-black rounded-2xl pl-2 pr-2"
                  >
                    <ClearIcon />
                  </button>
                </div>
                <Divider />
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <button
              onClick={clearAllTasks}
              className="p-2 border border-black rounded-2xl mt-2"
            >
              clear list
            </button>
          </div>
          <Edit
            open={open}
            onClose={handleEditClose}
            taskID={editTaskID}
            setTasks={setTasks}
          />
        </div>
      </div>
    </div>
  );
}
