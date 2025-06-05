"use client";
import { createContext, useContext, useState } from "react";

interface TimerContextType {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  timeLeft: number;
  isActive: boolean;
  currentMode: "pomodoro" | "shortBreak" | "longBreak";
  setPomodoroTime: (value: number | ((prev: number) => number)) => void;
  setShortBreakTime: (value: number | ((prev: number) => number)) => void;
  setLongBreakTime: (value: number | ((prev: number) => number)) => void;
  setMode: (mode: "pomodoro" | "shortBreak" | "longBreak") => void;
  setIsActive: (value: boolean | ((prev: boolean) => boolean)) => void;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const getLocalStorageValue = (key: string, defaultValue: number) => {
    const stored = localStorage.getItem(key);
    console.log(stored);
    return stored ? Number(stored) : defaultValue;
  };

  const [pomodoroTime, setPomodoroTime] = useState(() =>
    getLocalStorageValue("pomodoroTime", 25)
  );

  const [shortBreakTime, setShortBreakTime] = useState(() =>
    getLocalStorageValue("shortBreakTime", 5)
  );

  const [longBreakTime, setLongBreakTime] = useState(() =>
    getLocalStorageValue("longBreakTime", 15)
  );

  const [currentMode, setCurrentMode] = useState<
    "pomodoro" | "shortBreak" | "longBreak"
  >("pomodoro");

  const [timeLeft, setTimeLeft] = useState(pomodoroTime * 60);
  const [isActive, setIsActive] = useState(false);

  // Function to update mode and reset countdown
  const setMode = (mode: "pomodoro" | "shortBreak" | "longBreak") => {
    setCurrentMode(mode);

    // Reset countdown immediately
    if (mode === "pomodoro") {
      setTimeLeft(pomodoroTime * 60);
    } else if (mode === "shortBreak") {
      setTimeLeft(shortBreakTime * 60);
    } else {
      setTimeLeft(longBreakTime * 60);
    }

    // Stop the timer when mode changes
    setIsActive(false);
  };

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
