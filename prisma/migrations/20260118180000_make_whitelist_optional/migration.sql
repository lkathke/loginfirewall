-- AlterTable
-- Make whitelistId nullable in Group table
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "whitelistId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_Group" ("id", "name", "whitelistId", "createdAt")
SELECT "id", "name", "whitelistId", "createdAt" FROM "Group";

DROP TABLE "Group";

ALTER TABLE "new_Group" RENAME TO "Group";

PRAGMA foreign_keys=ON;
