"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface TimerContextType {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  timeLeft: number;
  isActive: boolean;
  currentMode: "pomodoro" | "shortBreak" | "longBreak";
  setPomodoroTime: (value: number) => void;
  setShortBreakTime: (value: number) => void;
  setLongBreakTime: (value: number) => void;
  setMode: (mode: "pomodoro" | "shortBreak" | "longBreak") => void;
  setIsActive: (active: boolean) => void;
  setTimeLeft: (time: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const getLocalStorageValue = (key: string, defaultValue: number) => {
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : defaultValue;
  };

  const [pomodoroTime, setPomodoroTime] = useState(() =>
    getLocalStorageValue("pomodoroTime", 25 * 60)
  );
  const [shortBreakTime, setShortBreakTime] = useState(() =>
    getLocalStorageValue("shortBreakTime", 5 * 60)
  );
  const [longBreakTime, setLongBreakTime] = useState(() =>
    getLocalStorageValue("longBreakTime", 15 * 60)
  );

  const [currentMode, setCurrentMode] = useState<"pomodoro" | "shortBreak" | "longBreak">("pomodoro");
  const [timeLeft, setTimeLeft] = useState(pomodoroTime);
  const [isActive, setIsActive] = useState(false);

  // Function to update mode and reset countdown
  const setMode = (mode: "pomodoro" | "shortBreak" | "longBreak") => {
    setCurrentMode(mode);

    // Reset countdown immediately
    if (mode === "pomodoro") {
      setTimeLeft(pomodoroTime);
    } else if (mode === "shortBreak") {
      setTimeLeft(shortBreakTime);
    } else {
      setTimeLeft(longBreakTime);
    }

    // Stop the timer when mode changes
    setIsActive(false);
  };

  // Save to localStorage effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("pomodoroTime", pomodoroTime.toString());
      localStorage.setItem("shortBreakTime", shortBreakTime.toString());
      localStorage.setItem("longBreakTime", longBreakTime.toString());
    }
  }, [pomodoroTime, shortBreakTime, longBreakTime]);

  return (
    <TimerContext.Provider
      value={{
        pomodoroTime,
        shortBreakTime,
        longBreakTime,
        timeLeft,
        isActive,
        currentMode,
        setPomodoroTime,
        setShortBreakTime,
        setLongBreakTime,
        setMode,
        setIsActive,
        setTimeLeft,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
