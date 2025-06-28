"use client";

import { FC, useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import "@fontsource/montserrat/200.css";
import { GoogleGenAI } from "@google/genai";

import TextField from "@mui/material/TextField";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Generate: FC<DialogComponentProps> = ({ open, onClose, setTasks }) => {
  const [generateText, setGenerateText] = useState("");

  const genAI = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
  });

  const prompt = `This is the user's task description ${generateText}. Split this large task into a task list and format it into a JSON string format like [{"id":1750653019051,"text":"task","completed":false,"numPomodoro":1},{"id":1750653021634,"text":"math","completed":false,"numPomodoro":1},{"id":1750653024530,"text":"physics","completed":false,"numPomodoro":1}] with a random task id, the task as the ID, completed as false, and recommended number of pomodoros. Only return the JSON string, nothing else in your response.`;

  const generateResponse = async () => {
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    if (
      response.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0].content &&
      response.candidates[0].content.parts
    ) {
      const generatedText = response.candidates[0].content.parts
        .map((part) => part.text)
        .join("");
      const cleaned = generatedText
        .replace(/```json/, "")
        .replace(/```/, "")
        .trim();
      const parsedTasks = JSON.parse(cleaned) as Task[];
      setTasks(parsedTasks);
    }
    setTimeout(() => {
      onClose();
    }, 10);
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogActions sx={{ backgroundColor: "white", color: "#000000" }}>
        <Button onClick={onClose}>
          <CloseIcon sx={{ color: "black" }} />
        </Button>
      </DialogActions>

      <DialogTitle
        sx={{
          textAlign: "center",
          backgroundColor: "white",
          color: "#000000",
          padding: "0px",
        }}
      >
        generate task list
      </DialogTitle>
      <Divider />
      <DialogContent
        sx={{ backgroundColor: "white", color: "#000000", width: "32rem" }}
      >
        <Box className="flex flex-col items-center">
          <div className="flex justify-start w-full">
            <div>describe your project in detail:</div>
          </div>
          <TextField
            multiline
            minRows={8}
            maxRows={15}
            fullWidth
            type="text"
            variant="filled"
            value={generateText}
            autoComplete="off"
            onChange={(e) => {
              setGenerateText(e.target.value);
            }}
            sx={{
              width: "full",
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
        </Box>

        <DialogActions>
          <button
            onClick={generateResponse}
            className="p-2 border-2 border-black rounded-2xl transition duration-200 hover:shadow-lg hover:scale-105"
          >
            generate
          </button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default Generate;
