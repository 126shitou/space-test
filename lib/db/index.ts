import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const client = postgres(process.env.DATABASE_URL!, {
  max: 1, // Cloudflare Workers 建议使用单连接
  idle_timeout: 20,
  connect_timeout: 10,
});
export const db = drizzle({ client });
