"use client";
import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import ClearIcon from "@mui/icons-material/Clear";
import Edit from "../components/Edit";
import CheckIcon from "@mui/icons-material/Check";
import Generate from "../components/Generate";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

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

  const handleAIClose = () => {
    setOpenAI(false);
  };

  const handleEditOpen = (taskID: number) => {
    setEditTaskID(taskID);
    setOpen(true);
  };
  const handleEditClose = () => setOpen(false);

  const addTask = () => {
    if (newTask === "") {
      return;
    } else {
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
    }
  };

  const clearTask = (task: Task) => {
    const id = task.id;
    setTasks((prev) => prev.filter((task) => task.id !== id));
    deleteTask(task);
  };

  const clearAllTasks = () => {
    setTasks([]);
    deleteAllTasks();
  };

  const setCompleted = (user_task: Task) => {
    setTasks((prev) => {
      return prev.map((task) => {
        if (task.id === user_task.id) {
          return { ...task, completed: !user_task.completed };
        }
        return task;
      });
    });
    saveCompleted({
      id: user_task.id,
      text: user_task.text,
      completed: !user_task.completed,
      numPomodoro: user_task.numPomodoro,
    });
  };

  useEffect(() => {
    if (!session?.user) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (session?.user) {
        await loadData();
      }
    };

    fetchTasks();
  }, [session]);

  const saveTask = async (task: Task) => {
    if (session?.user) {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: task.id,
            userid: session.user.id,
            text: task.text,
            completed: task.completed,
            numPomodoro: task.numPomodoro,
          }),
        });

        if (!res.ok) {
          alert("Error saving task");
        }
      } catch (error) {
        console.error("Error saving task:", error);
        alert("Error saving task");
      }
    }
  };

  const deleteTask = async (user_task: Task) => {
    if (session?.user) {
      try {
        const res = await fetch("/api/tasks", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user_task.id,
            userid: session.user.id,
          }),
        });

        if (!res.ok) {
          alert("Error deleting task");
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Error deleting task");
      }
    }
  };

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

  const saveCompleted = async (task: Task) => {
    if (session?.user) {
      try {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: task.id,
            userid: session.user.id,
            text: task.text,
            completed: task.completed,
            numPomodoro: task.numPomodoro,
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
    <div className="flex justify-center text-black">
      <div className="bg-gray-100 rounded-lg w-1/3 text-center">
        <div className="text-2xl p-2">add tasks</div>
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
              className="p-2 border-2 border-black rounded-2xl transition duration-200 hover:shadow-lg hover:scale-105"
            >
              add
            </button>
          </div>
          <div className="p-2">or</div>
          <button
            onClick={handleAIOpen}
            className="relative gleam-button bg-gradient-to-r from-[#00d4ff] to-[#90f7ec] text-black border-2 border-black rounded-2xl px-5 py-2 font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(0,212,255,0.8)] overflow-hidden"
          >
            ✨generate with ai
          </button>

          <div className="text-2xl p-2">your tasks:</div>
          <Divider />
          <ul className="max-h-[50vh] overflow-y-auto">
            {tasks.map((task) => (
              <li key={task.id} className="break-words whitespace-normal">
                <span className="block">{task.text}</span>
                <span className="block">pomodoros: {task.numPomodoro}</span>
                <div className="flex gap-10 justify-center mb-2 mt-2">
                  <button
                    onClick={() => setCompleted(task)}
                    className="border-2"
                    style={{
                      borderRadius: "1rem",
                      backgroundColor: "transparent",
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
                    className="border-2 border-black rounded-2xl pl-2 pr-2 transition duration-200 hover:shadow-lg hover:scale-105"
                  >
                    edit
                  </button>
                  <button
                    onClick={() => clearTask(task)}
                    className="border-2 border-black rounded-2xl pl-2 pr-2 transition duration-200 hover:shadow-lg hover:scale-105"
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
              className="p-2 border-2 border-black rounded-2xl mt-2 transition duration-200 hover:shadow-lg hover:scale-105"
            >
              clear list
            </button>
          </div>
          <Edit
            open={open}
            onClose={handleEditClose}
            taskID={editTaskID}
            setTasks={setTasks}
            tasks={tasks}
          />
          <Generate open={openAI} onClose={handleAIClose} setTasks={setTasks} />
        </div>
      </div>
    </div>
  );
}
