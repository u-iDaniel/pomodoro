-- CreateTable
CREATE TABLE "task" (
    "taskid" VARCHAR(255) NOT NULL,
    "userid" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "numPomodoros" INTEGER NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("taskid")
);

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE CASCADE ON UPDATE NO ACTION;
