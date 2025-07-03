"use client";
import { createContext, useContext, useState } from "react";

interface TimerContextType {
  pomodoroTime: string;
  shortBreakTime: string;
  longBreakTime: string;
  timeLeft: number;
  isActive: boolean;
  currentMode: "pomodoro" | "shortBreak" | "longBreak";
  setPomodoroTime: (value: string | ((prev: string) => string)) => void;
  setShortBreakTime: (value: string | ((prev: string) => string)) => void;
  setLongBreakTime: (value: string | ((prev: string) => string)) => void;
  setMode: (mode: "pomodoro" | "shortBreak" | "longBreak") => void;
  setIsActive: (value: boolean | ((prev: boolean) => boolean)) => void;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const getLocalStorageValue = (key: string, defaultValue: string) => {
    const stored = localStorage.getItem(key);
    return stored ? stored : defaultValue;
  };

  const [pomodoroTime, setPomodoroTime] = useState(() =>
    getLocalStorageValue("pomodoroTime", "25")
  );

  const [shortBreakTime, setShortBreakTime] = useState(() =>
    getLocalStorageValue("shortBreakTime", "5")
  );

  const [longBreakTime, setLongBreakTime] = useState(() =>
    getLocalStorageValue("longBreakTime", "15")
  );

  const [currentMode, setCurrentMode] = useState<
    "pomodoro" | "shortBreak" | "longBreak"
  >("pomodoro");

  const [timeLeft, setTimeLeft] = useState(Math.round(Number(pomodoroTime) * 60));
  const [isActive, setIsActive] = useState(false);

  // Function to update mode and reset countdown
  const setMode = (mode: "pomodoro" | "shortBreak" | "longBreak") => {
    setCurrentMode(mode);

    // Reset countdown immediately
    if (mode === "pomodoro") {
      setTimeLeft(Math.round(Number(pomodoroTime) * 60));
    } else if (mode === "shortBreak") {
      setTimeLeft(Math.round(Number(shortBreakTime) * 60));
    } else {
      setTimeLeft(Math.round(Number(longBreakTime) * 60));
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
