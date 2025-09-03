import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

export function createDb() {
  const client = postgres(process.env.DATABASE_URL!, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  return drizzle({ client });
}
