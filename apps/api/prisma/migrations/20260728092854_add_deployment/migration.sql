-- CreateTable
CREATE TABLE "Deployment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "providerId" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variables" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "planOutput" TEXT,
    "applyOutput" TEXT,
    "destroyOutput" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deployment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "CloudProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
