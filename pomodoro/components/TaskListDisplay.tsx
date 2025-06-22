import { useEffect, useState } from "react";
import Divider from "@mui/material/Divider";

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

  return (
    <div className="border">
      <div className="text-2xl p-2 text-center text-white">your tasks:</div>
      <Divider sx={{ backgroundColor: "white" }} />
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="break-words whitespace-normal">
            <span className="block text-center text-white mt-2 ml-2 mr-2">
              {task.text}
            </span>
            <span className="block text-center text-white mb-2 ml-2 mr-2">
              pomodoros: {task.numPomodoro}
            </span>
            <Divider sx={{ backgroundColor: "white" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
