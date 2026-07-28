-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_clientId_name_key" ON "Project"("clientId", "name");

-- Backfill : un projet par défaut pour chaque client existant, pour ne pas perdre
-- les comptes cloud déjà créés (credentials + déploiements réels).
INSERT INTO "Project" ("clientId", "name")
SELECT "id", 'Projet principal' FROM "Client";

-- RedefineTables (CloudProvider référence maintenant Project au lieu de Client)
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_CloudProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    CONSTRAINT "CloudProvider_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_CloudProvider" ("id", "projectId", "type", "name", "credentials")
SELECT "cp"."id", "p"."id", "cp"."type", "cp"."name", "cp"."credentials"
FROM "CloudProvider" "cp"
JOIN "Project" "p" ON "p"."clientId" = "cp"."clientId" AND "p"."name" = 'Projet principal';

DROP TABLE "CloudProvider";
ALTER TABLE "new_CloudProvider" RENAME TO "CloudProvider";

PRAGMA foreign_keys=ON;
