"use client";

import { FC, useState, ChangeEvent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useSession } from "next-auth/react";
import "@fontsource/montserrat/200.css";
import PDFToText from "react-pdftotext";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
  order: number;
}

interface DialogComponentProps {
  open: boolean;
  onClose: () => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

// Maximum file size limit set to 10MB to prevent performance issues and ensure efficient processing.
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const Generate: FC<DialogComponentProps> = ({ open, onClose, setTasks }) => {
  const { data: session } = useSession();
  const [mode, setMode] = useState<"text" | "pdf">("text");
  const [generateText, setGenerateText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const deleteAllTasks = async () => {
    if (session?.user) {
      try {
        await fetch("/api/tasks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid: session.user.id }),
        });
      } catch (error) {
        console.error("Error deleting all tasks:", error);
        alert("Error deleting all tasks");
      }
    }
  };

  const handleModeChange = (newMode: "text" | "pdf") => {
    if (newMode !== mode) {
      setMode(newMode);
      setGenerateText("");
      setPdfFile(null);
    }
  };

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_SIZE_BYTES) {
      alert("Please upload a file under 10 MB");
      e.target.value = "";
    }
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
      e.target.value = "";
    }
  };

  const generateResponse = async () => {
    setLoading(true);
    try {
      await deleteAllTasks();
      const pomodoroTime = localStorage.getItem("pomodoroTime");

      const formData = new FormData();
      formData.append("pomodoroTime", pomodoroTime || "");
      formData.append("mode", mode);
      if (mode === "text") {
        formData.append("generateText", generateText);
      } else if (mode === "pdf" && pdfFile) {
        const pdfText = await PDFToText(pdfFile);
        formData.append("generateText", pdfText);
      }

      await fetch("/api/gemini", {
        method: "POST",
        body: formData,
      });

      await loadData();
    } catch (error) {
      console.error("Error generating tasks:", error);
      alert("Error generating tasks");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const loadData = async () => {
    if (session?.user) {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setTasks(data.task_list);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
        alert("Error loading tasks");
      }
    }
  };

  const isGenerateDisabled =
    loading || (mode === "text" ? generateText.trim().length === 0 : !pdfFile);

  const buttonStyle = {
    fontFamily: "Montserrat, Arial, sans",
    fontWeight: "bold",
    borderRadius: "50px",
    px: 3,
    py: 1,
    textTransform: "none",
    transition: "transform 0.2s ease",
    minWidth: "120px",
  };

  const selectedButtonStyle = {
    ...buttonStyle,
    color: "white",
    backgroundColor: "#1E7D87",
    border: "2px solid #1E7D87",
    "&:hover": {
      backgroundColor: "#18666f",
      transform: "scale(1.05)",
    },
  };

  const unselectedButtonStyle = {
    ...buttonStyle,
    color: "#000000",
    border: "2px solid black",
    backgroundColor: "transparent",
    "&:hover": {
      transform: "scale(1.05)",
    },
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogActions sx={{ backgroundColor: "white" }}>
        <Button onClick={onClose}>
          <CloseIcon sx={{ color: "black" }} />
        </Button>
      </DialogActions>

      <DialogTitle
        sx={{
          textAlign: "center",
          backgroundColor: "white",
          color: "#000000",
          fontFamily: "Montserrat, Arial, sans",
          fontWeight: "bold",
          pt: 0,
        }}
      >
        generate task list
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          backgroundColor: "white",
          color: "#000000",
          width: "32rem",
          fontFamily: "Montserrat, Arial, sans",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          py: 3,
        }}
      >
        {/* Mode selector buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Button
            onClick={() => handleModeChange("text")}
            sx={mode === "text" ? selectedButtonStyle : unselectedButtonStyle}
          >
            input text
          </Button>
          <Button
            onClick={() => handleModeChange("pdf")}
            sx={mode === "pdf" ? selectedButtonStyle : unselectedButtonStyle}
          >
            upload PDF
          </Button>
        </Box>

        {/* Text Input Mode */}
        {mode === "text" && (
          <TextField
            label="describe your project in detail"
            multiline
            minRows={8}
            fullWidth
            variant="outlined"
            value={generateText}
            autoComplete="off"
            onChange={(e) => setGenerateText(e.target.value)}
            InputLabelProps={{
              style: { color: "rgba(0, 0, 0, 0.6)" },
            }}
            sx={{
              fontFamily: "Montserrat, Arial, sans",
              input: { color: "#000000" },
              "& .MuiOutlinedInput-root": {
                fontFamily: "Montserrat, Arial, sans",
                borderRadius: "16px",
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.4)",
                },
                "&:hover fieldset": {
                  borderColor: "#000000",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#000000",
                },
              },
            }}
          />
        )}

        {/* PDF Upload Mode */}
        {mode === "pdf" && (
          <Box
            sx={{
              width: "100%",
              p: 3,
              border: "2px dashed black",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 48, color: "black" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "black" }}
            >
              upload your PDF
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "black", textAlign: "center", maxWidth: "80%" }}
            >
              select a PDF file containing your slides, notes, or homework and
              we’ll generate a task list from it.
            </Typography>

            <Button
              variant="outlined"
              component="label"
              sx={{
                fontFamily: "Montserrat, Arial, sans",
                fontWeight: "bold",
                color: "#000000",
                border: "2px solid black",
                borderRadius: "50px",
                px: 3,
                py: 1,
                textTransform: "none",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: "transparent",
                },
              }}
            >
              select PDF
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={handlePdfChange}
              />
            </Button>

            {pdfFile && (
              <Typography
                variant="caption"
                sx={{ fontStyle: "italic", color: "#004d4d" }}
              >
                uploaded: {pdfFile.name}
              </Typography>
            )}
          </Box>
        )}

        <DialogActions sx={{ justifyContent: "flex-end", width: "100%" }}>
          <Button
            onClick={generateResponse}
            disabled={isGenerateDisabled}
            sx={{
              fontFamily: "Montserrat, Arial, sans",
              fontWeight: "bold",
              color: "#000000",
              border: "2px solid black",
              borderRadius: "16px",
              px: 3,
              py: 1,
              textTransform: "none",
              transition: "transform 0.2s ease",
              opacity: isGenerateDisabled ? 0.5 : 1,
              "&:hover": {
                transform: isGenerateDisabled ? "none" : "scale(1.05)",
                backgroundColor: "transparent",
              },
            }}
          >
            {loading ? "generating..." : "generate"}
          </Button>
        </DialogActions>

        <Typography sx={{ textAlign: "center", mt: 1, fontStyle: "italic" }}>
          note: this will replace existing tasks
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default Generate;
