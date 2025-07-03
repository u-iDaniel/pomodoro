import { NextResponse } from "next/server";
import { auth } from "@/configuration/auth";
import prisma from "@/lib/prisma";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  numPomodoro: number;
}

export async function POST(req: Request) {

    const session = await auth();

    if (!session?.user) { // Checks if user is signed in
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const task: Task = await req.json(); // Extract all data from task

        if (
            !task ||
            typeof task.id !== "number" ||
            typeof task.text !== "string" ||
            task.text.trim() === "" ||
            typeof task.completed !== "boolean" ||
            typeof task.numPomodoro !== "number" ||
            task.numPomodoro < 0
        ) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const task_id = String(task.id);
        const user_id = session.user.id!;
        const task_text = task.text;
        const task_completed = task.completed;
        const task_pomodoros = task.numPomodoro;

        await prisma.task.create({ // Store task in database
            data: {
                taskid: task_id,
                userid: user_id,
                text: task_text,
                completed: task_completed,
                numPomodoros: Number(task_pomodoros)
            },
        });

        return NextResponse.json({
            message: "Task saved!",
            task_id,
            user_id,
            task_text,
            task_completed,
            task_pomodoros
        }, { status: 201 });
    } catch (error) {
        console.error("Error processing task:", error);
        return NextResponse.json({ error: "Processing error" }, { status: 500 });
    }
}

export async function GET() { 
    const session = await auth();

    if (!session?.user) { // Checks if user is signed in
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const task_list_temp = await prisma.task.findMany({ // Finds all tasks with the same user id and sorts in ascending order
            where: {
                userid: session.user.id!,
            },
            orderBy: {
                taskid: 'asc'
            }
        });

        const task_list = task_list_temp.map((task) => ({
            id: +task.taskid,
            text: task.text,
            completed: task.completed,
            numPomodoro: task.numPomodoros
        } satisfies Task))

        return NextResponse.json({ task_list }, { status: 200 });
    } catch (error) {
        console.error("Error fetching task_list:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();

    if (!session?.user) { // Checks if user is signed in
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await req.json();

    if (task.id) {
        if (typeof task.id !== "number") {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

    try {
        const task_id = String(task.id);
        const delete_task = await prisma.task.delete({
            where: {
                taskid: task_id,
            }
        });

        return NextResponse.json({delete_task}, {status: 200});
    } catch (error) {
        console.error("Error deleting task", error);
        return NextResponse.json({error: "Database error"}, {status: 500});
    }
} else {
    try {
        const delete_task = await prisma.task.deleteMany({
            where: {
                userid: session.user.id,
            }
        });

        return NextResponse.json({delete_task}, {status: 200});
    } catch (error) {
        console.error("Error deleting all tasks", error);
        return NextResponse.json({error: "Database error"}, {status: 500});
    }
}
}

export async function PATCH(req: Request) {

    const session = await auth();

    if (!session?.user) { // Checks if user is signed in
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const task: Task = await req.json(); // Extract all data from task

        if (
            !task ||
            typeof task.id !== "number" ||
            typeof task.text !== "string" ||
            task.text.trim() === "" ||
            typeof task.completed !== "boolean" ||
            typeof task.numPomodoro !== "number" ||
            task.numPomodoro < 0
        ) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const task_id = String(task.id);
        const user_id = session.user.id!;
        const task_text = task.text;
        const task_completed = task.completed;
        const task_pomodoros = task.numPomodoro;

        await prisma.task.update({ // Store task in database
            where: {
                taskid: task_id,
                userid: user_id
            },
            data: {
                text: task_text,
                completed: task_completed,
                numPomodoros: Number(task_pomodoros)
            },
        });

        return NextResponse.json({
            message: "Task edited!",
            task_id,
            user_id,
            task_text,
            task_completed,
            task_pomodoros
        }, { status: 201 });
    } catch (error) {
        console.error("Error processing task edit:", error);
        return NextResponse.json({ error: "Processing error" }, { status: 500 });
    }
}