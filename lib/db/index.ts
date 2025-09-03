import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Cloudflare Workers 优化的数据库连接配置
const client = postgres(process.env.DATABASE_URL!, {
  max: 1, // Cloudflare Workers 建议使用单连接
  idle_timeout: 20, // 空闲超时时间（秒）
  connect_timeout: 10, // 连接超时时间（秒）
  prepare: false, // 禁用预处理语句，提高兼容性
});

export const db = drizzle({ client });
