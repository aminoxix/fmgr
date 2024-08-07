import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["fmgr_*"],
} satisfies Config;
