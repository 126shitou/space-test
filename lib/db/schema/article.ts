import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// 定义博客状态枚举
export const blogStatusEnum = pgEnum("blog_status", [
  "draft",
  "published",
  "offline",
]);

/**
 * 博客文章表
 * 用于存储博客文章的基本信息和内容
 */
export const blogs = pgTable("blogs", {
  // 博客ID - 主键，使用nanoid生成唯一标识
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // 博客标题 - 文本字段
  title: text("title").notNull(),

  // 博客内容 - HTML格式的长文本
  content: text("content").notNull(),

  // 博客摘要 - 可选的文本字段
  summary: text("summary"),

  // 作者名称 - 默认为"管理员"
  author: text("author").default("admin"),

  // 分类名称 - 可选字段
  category: text("category"),

  // 标签 - 逗号分隔的标签字符串
  tags: text("tags"),

  // 状态 - 枚举类型：草稿、已发布、已下线
  status: blogStatusEnum("status").default("draft").notNull(),

  // 浏览次数 - 默认为0
  viewCount: integer("view_count").default(0).notNull(),

  // 发布时间 - 可为空的时间戳
  publishedAt: timestamp("published_at"),

  // 创建时间 - 默认当前时间
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // 更新时间 - 默认当前时间
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 导出博客表类型
export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
