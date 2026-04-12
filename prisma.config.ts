import "dotenv/config";
import { defineConfig } from "prisma/config";
import { normalizeDatabaseUrl } from "./src/lib/database-url";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: normalizeDatabaseUrl(process.env["DATABASE_URL"]!),
  },
});
