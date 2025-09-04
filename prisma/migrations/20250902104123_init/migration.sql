-- CreateTable
CREATE TABLE "User" (
    "name" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
