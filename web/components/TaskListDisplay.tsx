"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Box,
  Typography,
  Divider,
  Button,
  IconButton,
  Collapse,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Edit from "../components/Edit";
import Generate from "../components/Generate";
import AddTask from "../components/AddTask";
import { keyframes } from "@emotion/react";

import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
  order: number;
}

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export default function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined" && !session?.user) {
      const stored = localStorage.getItem("tasks");
      return stored ? JSON.parse(stored) : [];
    } else {
      return [];
    }
  });

  const [editTaskID, setEditTaskID] = useState(0);
  const [open, setOpen] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [taskListCollapsed, setTaskListCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over?.id);

      let arrangeTasks = arrayMove(tasks, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          order: index + 1,
        })
      );

      setTasks(arrangeTasks);

      if (!session?.user) {
        localStorage.setItem("tasks", JSON.stringify(arrangeTasks));
      } else {
        const updatedOldTask = arrangeTasks.find((t) => t.id === active.id);
        const updatedNewTask = arrangeTasks.find((t) => t.id === over?.id);

        if (updatedOldTask) saveRearrange(updatedOldTask);
        if (updatedNewTask) saveRearrange(updatedNewTask);
      }
    }
  };

  const saveRearrange = (task: Task) => {
    saveEditData({
      ...task,
    });
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

  const handleAIOpen = () => {
    if (!session?.user) redirect("/login");
    setOpenAI(true);
  };

  const handleAIClose = () => setOpenAI(false);
  const handleEditOpen = (taskID: number) => {
    setEditTaskID(taskID);
    setOpen(true);
  };
  const handleEditClose = () => setOpen(false);

  const handleAddOpen = () => setOpenAdd(true);
  const handleAddClose = () => setOpenAdd(false);

  const clearTask = (task: Task) => {
    let updatedTasks = tasks.filter((t) => t.id !== task.id);
    updatedTasks = updatedTasks.map((t, index) => {
      return {
        ...t,
        order: index + 1,
      };
    });
    setTasks(updatedTasks);
    deleteTask(task);
    if (session?.user) {
      for (let index = 0; index < updatedTasks.length; index++) {
        saveRearrange(updatedTasks[index]);
      }
    }
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

  const deleteTask = async (task: Task) => {
    if (!session?.user) return;
    try {
      await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, userid: session.user.id }),
      });
    } catch (error) {
      alert("Error deleting task");
    }
  };

  const deleteAllTasks = async () => {
    if (!session?.user) return;
    try {
      await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: session.user.id }),
      });
    } catch (error) {
      alert("Error deleting all tasks");
    }
  };

  const saveCompleted = async (task: Task) => {
    if (!session?.user) return;
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, userid: session.user.id }),
      });
    } catch (error) {
      alert("Error editing task");
    }
  };

  const loadData = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.task_list);
    } catch (error) {
      alert("Error loading tasks");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        boxShadow: 3,
        borderRadius: "20px",
        color: "white",
        fontFamily: "Montserrat, Arial, sans",
        display: "flex",
        flexDirection: "column",
        p: 3,
      }}
    >
      {/* Header with collapse toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setTaskListCollapsed((prev) => !prev)}
      >
        <Typography variant="h6" fontWeight="bold">
          your tasks
        </Typography>
        <IconButton sx={{ color: "white" }}>
          {taskListCollapsed ? (
            <KeyboardArrowDownIcon />
          ) : (
            <KeyboardArrowUpIcon />
          )}
        </IconButton>
      </Box>

      <Collapse in={!taskListCollapsed} timeout={400}>
        <Button
          onClick={handleAIOpen}
          sx={{
            background: "linear-gradient(to right, #00F0FF, #8B5CF6)", // static gradient by default
            width: "100%",
            color: "white",
            fontWeight: "bold",
            borderRadius: "16px",
            textTransform: "none",
            marginTop: "1rem",
            marginBottom: 2,
            px: 4,
            py: 1.5,
            boxShadow: "0px 0px 10px rgba(0,212,255,0.4)",
            transition: "transform 0.3s ease",
            "&:hover": {
              background: "linear-gradient(270deg, #00F0FF, #8B5CF6, #00F0FF)", // animated gradient
              backgroundSize: "600% 600%", // bigger background for animation
              animation: `${gradientAnimation} 5s ease infinite`,
              transform: "scale(1.05)",
              boxShadow: "0px 0px 20px rgba(0,212,255,0.6)",
            },
          }}
        >
          ✨ generate with AI
        </Button>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ maxHeight: "40vh", overflowY: "auto" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {tasks.map((task) => (
                  <SortableItem
                    key={task.id}
                    task={task}
                    onComplete={setCompleted}
                    onEdit={handleEditOpen}
                    onDelete={clearTask}
                  />
                ))}
                <li
                  onClick={handleAddOpen}
                  style={{
                    cursor: "pointer",
                    borderRadius: "12px",
                    padding: "12px",
                    marginBottom: "12px",
                    backgroundColor: "rgba(38, 151, 163, 0.12)",
                    border: "1px solid white",
                    color: "white",
                    textAlign: "center",
                    fontWeight: 500,
                    userSelect: "none",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(38, 151, 163, 0.25)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(38, 151, 163, 0.12)")
                  }
                >
                  + add task
                </li>
              </ul>
            </Box>
          </SortableContext>
        </DndContext>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            onClick={clearAllTasks}
            sx={{
              px: 2,
              py: 1,
              borderRadius: "16px",
              border: "2px solid white",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              transition:
                "transform 0.2s ease, color 0.2s ease, border-color 0.2s ease",
              "&:hover": {
                color: "#FF5555",
                borderColor: "#FF5555",
                transform: "scale(1.05)",
                backgroundColor: "transparent",
              },
            }}
          >
            clear list
          </Button>
        </Box>
      </Collapse>

      <Edit
        open={open}
        onClose={handleEditClose}
        taskID={editTaskID}
        setTasks={setTasks}
        tasks={tasks}
      />
      <AddTask
        open={openAdd}
        onClose={handleAddClose}
        setTasks={setTasks}
        tasks={tasks}
      />
      <Generate open={openAI} onClose={handleAIClose} setTasks={setTasks} />
    </Box>
  );
}

function SortableItem({
  task,
  onComplete,
  onEdit,
  onDelete,
}: {
  task: Task;
  onComplete: (t: Task) => void;
  onEdit: (id: number) => void;
  onDelete: (t: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "manipulation",
  };

  return (
    <li
      ref={setNodeRef}
      style={{
        ...style,
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "12px",
        backgroundColor: "rgba(38, 151, 163, 0.12)",
        border: "1px solid white",
        position: "relative",
        userSelect: "none",
        paddingRight: "48px",
      }}
      {...attributes}
    >
      <IconButton
        {...listeners}
        sx={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          cursor: "grab",
          p: 0.5,
        }}
        aria-label="Drag handle"
        size="small"
      >
        <DragIndicatorIcon />
      </IconButton>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          gap: 0.5,
          maxWidth: "calc(100% - 56px)",
          wordWrap: "break-word",
        }}
      >
        <Typography sx={{ fontWeight: 500 }}>{task.text}</Typography>
        <Typography sx={{ fontSize: "0.9rem", opacity: 0.85 }}>
          pomodoros: {task.numPomodoro}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <IconButton
            onClick={() => onComplete(task)}
            className={`
              rounded-[1rem] border-2 transition-transform duration-300
              ${
                task.completed
                  ? "border-[#00FF37] text-[#00FF37]"
                  : "border-white text-white"
              }
              hover:scale-105
            `}
            style={{ borderStyle: "solid" }}
            size="small"
          >
            <CheckIcon />
          </IconButton>

          <Button
            onClick={() => onEdit(task.id)}
            variant="outlined"
            size="small"
            sx={{
              color: "white",
              borderColor: "white",
              borderRadius: "16px",
              textTransform: "none",
              fontWeight: "bold",
              borderWidth: 2,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "scale(1.05)" },
              minWidth: 64,
              px: 1.5,
            }}
          >
            edit
          </Button>

          <IconButton
            onClick={() => onDelete(task)}
            sx={{
              borderRadius: "16px",
              color: "white",
              border: "2px solid white",
              fontWeight: "bold",
              transition:
                "transform 0.2s ease, color 0.2s ease, border-color 0.2s ease",
              "&:hover": {
                color: "#FF5555",
                borderColor: "#FF5555",
                transform: "scale(1.05)",
              },
            }}
            size="small"
          >
            <ClearIcon />
          </IconButton>
        </Box>
      </Box>
    </li>
  );
}
