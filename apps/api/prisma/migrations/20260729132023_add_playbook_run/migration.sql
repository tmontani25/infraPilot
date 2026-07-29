-- CreateTable
CREATE TABLE "PlaybookRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "providerId" INTEGER NOT NULL,
    "playbookId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetVms" TEXT NOT NULL,
    "sshUser" TEXT NOT NULL DEFAULT 'ubuntu',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "output" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlaybookRun_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "CloudProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
