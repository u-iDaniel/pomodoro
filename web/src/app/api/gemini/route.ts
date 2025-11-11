import { NextResponse } from "next/server";
import { auth } from "@/configuration/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
  order: number;
}

const rateLimitFree = new Ratelimit({
  redis: Redis.fromEnv(),                                  // Connects using env vars (URL + TOKEN)
  limiter: Ratelimit.slidingWindow(5, "24 h"),   // 5 requests per 10 seconds per identifier
  prefix: "@upstash/ratelimit",                   // Optional Redis key prefix
  analytics: true                                 // Enables Upstash internal analytics
});

const rateLimitMember = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "24 h"),  // 100 per day
  prefix: "@upstash/ratelimit",
  analytics: true
})


export async function POST(req: Request) {

    const session = await auth();

    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    if (!session?.user) { // Checks if user is signed in and there is a valid API key
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = session.user.id;

    let result;

    if (session?.user?.isMember) {
      result = await rateLimitMember.limit(identifier);
    } else {
      result = await rateLimitFree.limit(identifier);
    }

    if (!result.success) {
      return NextResponse.json({ error: "Free users get 5 free generations per day, while members get 100 generation per day. Try again later." }, { status: 429 });
    }

    const formData = await req.formData();
    const pomodoroTime = formData.get("pomodoroTime");
    const mode = formData.get("mode");
    const generateText = formData.get("generateText")?.toString() || "";

    let prompt;

    if (mode === "text") {
      prompt = `This is the user's task description: ${generateText}. Split this large task into a task list and format it into a JSON string format like [{"text":"math","completed":false,"numPomodoro":1,"order":1},{"text":"physics","completed":false,"numPomodoro":1,"order":2}] with completed as false, recommended number of pomodoros, and the order should be ascending starting from 1 and incrementing by 1 until the last task. The user's pomodoro time is ${pomodoroTime} minutes, so make sure each task has a suitable amount of time for completion. Only return the JSON string, nothing else in your response. If the description is not relevant or empty, return nothing.`;
    } else {
      prompt = `This is the text of a PDF file the user uploaded which may contain notes, homework, or something similar: ${generateText}. Create a task list based on this information and format it into a JSON string format like [{"text":"math","completed":false,"numPomodoro":1,"order":1},{"text":"physics","completed":false,"numPomodoro":1,"order":2}] with completed as false, recommended number of pomodoros, and the order should be ascending starting from 1 and incrementing by 1 until the last task. The user's pomodoro time is ${pomodoroTime} minutes, so make sure each task has a suitable amount of time for completion. Only return the JSON string, nothing else in your response. If the description is not relevant or empty, return nothing.`;
    }
    
    try {
      const response = await genAI.models.generateContent({
      model: "gemma-3-27b-it",
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

      const formattedTasks = parsedTasks.map((task) => ({taskid: `${Date.now()}${task.order}`, userid: session.user.id!, text: task.text, completed: task.completed, numPomodoros: task.numPomodoro, order_task: task.order}));
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