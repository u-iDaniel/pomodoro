import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/configuration/auth";
import prisma from "@/lib/prisma";
import { APICallError, generateText, NoObjectGeneratedError, Output, RetryError } from "ai";
import { google } from "@ai-sdk/google";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Zod Schemas for Type Safety
const FormDataInputSchema = z.object({
  pomodoroTime: z.coerce.number().positive("Pomodoro time must be positive"),
  mode: z.enum(["text", "pdf"], "Mode must be either 'text' or 'pdf'"),
  generateText: z.string().min(1, "Generate text cannot be empty"),
});

const TaskObjectSchema = z.object({
  text: z.string().min(1, "Task text is required"),
  completed: z.boolean(),
  numPomodoro: z.number().positive("numPomodoro must be positive"),
  order: z.number().positive("order must be positive"),
});

const TasksArraySchema = z.array(TaskObjectSchema);
const GeneratedTasksOutputSchema = z.object({
  tasks: TasksArraySchema,
});

type Task = z.infer<typeof TaskObjectSchema>;

const normalizeTaskOrders = (tasks: Task[]): Task[] => {
  // Keep the model's intended relative order, then enforce strict 1..N ordering.
  return tasks
    .map((task, originalIndex) => ({ task, originalIndex }))
    .sort((a, b) => {
      if (a.task.order === b.task.order) {
        return a.originalIndex - b.originalIndex;
      }
      return a.task.order - b.task.order;
    })
    .map(({ task }, index) => ({
      ...task,
      order: index + 1,
    }));
};

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

    if (!session?.user) {
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

    try {
      const formData = await req.formData();
      
      // Validate formData input using Zod
      const validatedInput = FormDataInputSchema.parse({
        pomodoroTime: formData.get("pomodoroTime"),
        mode: formData.get("mode"),
        generateText: formData.get("generateText")?.toString() || "",
      });

      const { pomodoroTime, mode, generateText: generateTextContent } = validatedInput;

      let prompt;

      if (mode === "text") {
        prompt = `This is the user's task description: ${generateTextContent}. Split this large task into a task list with completed as false, recommended number of pomodoros, and the order ascending from 1.
                  Every task must have a unique order value with no duplicates.
                  The user's pomodoro time is ${pomodoroTime} minutes, so make each task suitable for that duration.`;
      } else {
        prompt = `This is the text of a PDF file the user uploaded which may contain notes, homework, or something similar: ${generateTextContent}. Create a task list from this information with completed as false, recommended number of pomodoros, and the order ascending from 1.
                  Every task must have a unique order value with no duplicates.
                  The user's pomodoro time is ${pomodoroTime} minutes, so make each task suitable for that duration.`;
      }

      // Initialize Vercel AI SDK model
      const model = google("gemma-4-31b-it"); // requires GOOGLE_GENERATIVE_AI_API_KEY env var to be set

      // Generate content using Vercel AI SDK
      const response = await generateText({
        model,
        prompt,
        timeout: 25000,
        maxRetries: 1,
        output: Output.object({
          schema: GeneratedTasksOutputSchema,
          name: "generated_tasks",
          description: "Generated pomodoro task list",
        }),
      });

      const parsedOutput = GeneratedTasksOutputSchema.parse(response.output);
      const parsedTasks: Task[] = normalizeTaskOrders(parsedOutput.tasks);

      if (parsedTasks.length === 0) {
        return NextResponse.json({ error: "No tasks generated from input" }, { status: 400 });
      }

      const formattedTasks = parsedTasks.map((task) => ({
        taskid: `${Date.now()}${task.order}`,
        userid: session.user.id,
        text: task.text,
        completed: task.completed,
        numPomodoros: task.numPomodoro,
        order_task: task.order,
      }));

      await prisma.task.createMany({
        data: formattedTasks,
      });

      return NextResponse.json(
        {
          generatedTasks: parsedTasks,
        },
        { status: 201 }
      );
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.issues);
        return NextResponse.json(
          { error: "Invalid input: " + error.issues.map((issue) => issue.message).join(", ") },
          { status: 400 }
        );
      }

      if (NoObjectGeneratedError.isInstance(error)) {
        console.error("No object generated:", error.message);
        return NextResponse.json(
          { error: "The model returned an invalid response format. Please try again." },
          { status: 502 }
        );
      }

      if (RetryError.isInstance(error)) {
        console.error("Retry error:", error.reason, error.lastError);
        const isHeadersTimeout =
          error.lastError instanceof APICallError &&
          typeof error.lastError.message === "string" &&
          error.lastError.message.includes("Headers Timeout Error");

        return NextResponse.json(
          {
            error: isHeadersTimeout
              ? "The AI provider is timing out right now. Please retry in a moment."
              : "The AI provider is temporarily unavailable. Please retry.",
          },
          { status: 504 }
        );
      }

      console.error("Error generating:", error);
      return NextResponse.json({ error: "Error generating" }, { status: 500 });
    }
}