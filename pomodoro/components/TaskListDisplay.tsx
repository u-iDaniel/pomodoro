import { useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import CheckIcon from "@mui/icons-material/Check";
import "../src/app/globals.css";
import { useSession } from "next-auth/react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

export default function TaskListDisplay() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!session?.user) {
      const stored = localStorage.getItem("tasks");
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } else {
      loadData();
    }
  }, [session]);

  const setCompleted = (user_task: Task) => {
    setTasks((prev) => {
      const updateTasks = prev.map((task) => {
        if (task.id === user_task.id) {
          return { ...task, completed: !user_task.completed };
        } else {
          return task;
        }
      });

      if (!session?.user) {
        localStorage.setItem("tasks", JSON.stringify(updateTasks));
      }
      return updateTasks;
    });
    saveCompleted({
      id: user_task.id,
      text: user_task.text,
      completed: !user_task.completed,
      numPomodoro: user_task.numPomodoro,
    });
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
          console.log("Setting tasks...");
          setTasks(data.task_list);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
        alert("Error loading tasks");
      }
    }
  };

  return (
    <div className="">
      <div className="text-2xl p-2 text-center text-white border">
        your tasks:
      </div>
      <Divider sx={{ backgroundColor: "white" }} />
      <div className="max-h-[220px] overflow-y-auto">
        <ul>
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
                  onClick={() => setCompleted(task)}
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
    </div>
  );
}
