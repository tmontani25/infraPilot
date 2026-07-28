-- CreateTable
CREATE TABLE "Serveur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER,
    "name" TEXT NOT NULL,
    "hebergement" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "distribution" TEXT,
    "deploymentType" TEXT,
    "cloudProviderId" INTEGER,
    "cloudVmId" TEXT,
    "cpu" INTEGER,
    "ram" INTEGER,
    "disk" INTEGER,
    "ip" TEXT,
    "ssh" TEXT,
    "rdp" TEXT,
    "vpn" TEXT,
    "sauvegardes" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Serveur_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Serveur_cloudProviderId_fkey" FOREIGN KEY ("cloudProviderId") REFERENCES "CloudProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServeurEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serveurId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServeurEvent_serveurId_fkey" FOREIGN KEY ("serveurId") REFERENCES "Serveur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
