import { useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import CheckIcon from "@mui/icons-material/Check";
import "../src/app/globals.css";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

export default function TaskListDisplay() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  const setCompleted = (id: number) => {
    setTasks((prev) => {
      const updateTasks = prev.map((task) => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        else {return task;}
    });

      localStorage.setItem("tasks", JSON.stringify(updateTasks));
      return updateTasks;
    });
  };

  return (
    <div className="">
      <div className="text-2xl p-2 text-center text-white border">your tasks:</div>
      <Divider sx={{ backgroundColor: "white" }} />
      <ul className="max-h-[288px] overflow-y-auto">
        {tasks.map((task) => (
          <li key={task.id} className="break-words whitespace-normal border">
            <span className="block text-center text-white mt-2 ml-2 mr-2">
              {task.text}
            </span>
            <span className="block text-center text-white mb-2 ml-2 mr-2">
              pomodoros: {task.numPomodoro}
            </span>
            <span className="block text-center text-white mb-2 ml-2 mr-2">
            <button
                    onClick={() => setCompleted(task.id)}
                    className="border-2"
                    style={{
                      borderRadius: "1rem",
                      backgroundColor: "transparent",
                      borderStyle: "solid",
                      paddingLeft: "0.5rem",
                      paddingRight: "0.5rem",
                      borderColor: task.completed ? "#00FF37" : "white",
                      color: task.completed ? "#00FF37" : "white",
                      transition: "border-color 0.4s ease, color 0.4s ease",
                      fontFamily: "Montserrat, Arial, sans",
                      fontWeight: "200",
                    }}
                  >
                    <CheckIcon />
                  </button>
                  </span>
            <Divider sx={{ backgroundColor: "white" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
