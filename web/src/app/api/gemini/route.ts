import { NextResponse } from "next/server";
import { auth } from "@/configuration/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

export async function POST(req: Request) {


    const session = await auth();

    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    if (!session?.user) { // Checks if user is signed in and there is a valid API key
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const description = await req.json();

    const prompt = `This is the user's task description: ${description.generateText}. Split this large task into a task list and format it into a JSON string format like [{"id":1750653019051,"text":"task","completed":false,"numPomodoro":1},{"id":1750653021634,"text":"math","completed":false,"numPomodoro":1},{"id":1750653024530,"text":"physics","completed":false,"numPomodoro":1}] with each task ID as the current time in milliseconds since January 1, 1970, 00:00:00 UTC ascending in order from first to last task, completed as false, and recommended number of pomodoros. The user's pomodoro time is ${description.pomodoroTime} minutes, so make sure each task has a suitable amount of time for completion. Only return the JSON string, nothing else in your response. If the description is not relevant, return nothing.`;

    try {
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

      const formattedTasks = parsedTasks.map((task) => ({taskid: String(task.id), userid: session.user.id!, text: task.text, completed: task.completed, numPomodoros: task.numPomodoro}));
      await prisma.task.createMany({
        data: formattedTasks
      });

      return NextResponse.json({
            generatedTasks: parsedTasks
        }, { status: 201 });
    }

    } catch (error) {
        console.error("Error generating:", error);
        return NextResponse.json({ error: "Error generating" }, { status: 500 });
    }
}