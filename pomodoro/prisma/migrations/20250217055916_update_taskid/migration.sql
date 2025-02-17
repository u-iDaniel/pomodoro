-- CreateTable
CREATE TABLE "preference" (
    "taskid" UUID NOT NULL,
    "userid" UUID NOT NULL,
    "preferencetype" VARCHAR(255) NOT NULL,
    "preferencedetail" TEXT,

    CONSTRAINT "preference_pkey" PRIMARY KEY ("taskid")
);

-- CreateTable
CREATE TABLE "users" (
    "userid" UUID NOT NULL,
    "googleemail" VARCHAR(255) NOT NULL,
    "imageicon" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_googleemail_key" ON "users"("googleemail");

-- AddForeignKey
ALTER TABLE "preference" ADD CONSTRAINT "preference_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE CASCADE ON UPDATE NO ACTION;
