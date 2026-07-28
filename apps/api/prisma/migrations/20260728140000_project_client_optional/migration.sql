-- RedefineTables (clientId devient optionnel : un projet peut ne pas être rattaché à un client)
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER,
    "name" TEXT NOT NULL,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Project" ("id", "clientId", "name")
SELECT "id", "clientId", "name" FROM "Project";

DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";

CREATE UNIQUE INDEX "Project_clientId_name_key" ON "Project"("clientId", "name");

PRAGMA foreign_keys=ON;
