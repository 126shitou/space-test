import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { SUBSCRIPTION_TYPE } from "@/lib/config/constant";

// 定义订阅类型枚举
export const subscriptionTypeEnum = pgEnum(
  "subscription_type",
  SUBSCRIPTION_TYPE
);

// 定义user表
export const users = pgTable("users", {
  supabaseId: text("supabase_id").primaryKey(), // Supabase提供的唯一ID作为主键
  name: text("name").notNull(), // 用户名
  avatar: text("avatar"), // 头像URL，可选
  email: text("email").notNull().unique(), // 邮箱，唯一
  points: integer("points").default(10).notNull(), // 积分，默认10
  subscriptionType: subscriptionTypeEnum("subscription_type")
    .default("free")
    .notNull(), // 订阅类型，默认Free
  createdAt: timestamp("created_at").defaultNow().notNull(), // 创建时间
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // 更新时间
  subscriptionsStartDate: timestamp("subscriptions_start_date"), // 订阅开始日期，可选
  subscriptionsEndDate: timestamp("subscriptions_end_date"), // 订阅结束日期，可选
  lastLogin: timestamp("last_login"), // 最后登录时间，可选
});

// 导出类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
