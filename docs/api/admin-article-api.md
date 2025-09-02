# 博客文章管理 API 接口文档

## 概述

本文档描述了博客文章管理系统的 API 接口，包括文章的创建、查询、更新和删除功能。所有接口都使用统一的响应格式，并包含完整的错误处理。

## 基础信息

- **基础路径**: `/api/admin/article`
- **响应格式**: JSON
- **认证**: 需要管理员权限
- **内容类型**: `application/json`

## 统一响应格式

所有接口都使用 `Result` 类型的统一响应格式：

### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据内容
  }
}
```

### 失败响应
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 数据模型

### Blog 文章模型

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 文章唯一标识符 (nanoid) |
| title | string | 是 | 文章标题 |
| content | string | 是 | 文章内容 (HTML格式) |
| summary | string | 否 | 文章摘要 |
| author | string | 否 | 作者名称，默认"admin" |
| category | string | 否 | 文章分类 |
| tags | string | 否 | 标签，逗号分隔 |
| status | enum | 是 | 文章状态："draft"\|"published"\|"offline" |
| viewCount | number | 是 | 浏览次数，默认0 |
| publishedAt | string\|null | 否 | 发布时间 (ISO 8601) |
| createdAt | string | 是 | 创建时间 (ISO 8601) |
| updatedAt | string | 是 | 更新时间 (ISO 8601) |

## API 接口

### 1. 创建文章

**接口地址**: `POST /api/admin/article`

**描述**: 创建新的博客文章

#### 请求参数

```json
{
  "title": "文章标题",
  "content": "文章内容",
  "summary": "文章摘要",
  "author": "作者名称",
  "category": "分类名称",
  "tags": "标签1,标签2,标签3",
  "status": "draft"
}
```

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| title | string | 是 | 文章标题 |
| content | string | 是 | 文章内容 |
| summary | string | 否 | 文章摘要 |
| author | string | 否 | 作者名称，默认"管理员" |
| category | string | 否 | 文章分类 |
| tags | string | 否 | 标签，逗号分隔 |
| status | string | 否 | 文章状态，默认"draft" |

#### 响应示例

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "abc123def456",
      "title": "文章标题",
      "content": "文章内容",
      "summary": "文章摘要",
      "author": "管理员",
      "category": "技术",
      "tags": "JavaScript,React",
      "status": "draft",
      "viewCount": 0,
      "publishedAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "博客文章创建成功"
  }
}
```

**错误响应 (400)**:
```json
{
  "success": false,
  "message": "标题和内容不能为空"
}
```

---

### 2. 分页查询文章列表

**接口地址**: `GET /api/admin/article/list`

**描述**: 分页查询博客文章列表，支持多条件筛选

#### 查询参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| title | string | 否 | 标题模糊查询 |
| status | string | 否 | 状态筛选："draft"\|"published"\|"offline" |
| category | string | 否 | 分类筛选 |
| author | string | 否 | 作者筛选 |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |

#### 请求示例

```
GET /api/admin/article/list?title=React&status=published&page=1&pageSize=10
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "abc123def456",
        "title": "React 入门教程",
        "summary": "这是一篇关于React的入门教程",
        "author": "管理员",
        "category": "技术",
        "tags": "React,JavaScript",
        "status": "published",
        "viewCount": 100,
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "contentPreview": "这是文章内容的前200个字符..."
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

**注意**: 列表查询返回的文章对象不包含完整的 `content` 字段，而是提供 `contentPreview` 字段（前200个字符），以减少数据传输量。

---

### 3. 获取文章详情

**接口地址**: `GET /api/admin/article/[id]`

**描述**: 根据文章ID获取文章详细信息，并自动增加浏览量

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 文章ID |

#### 请求示例

```
GET /api/admin/article/abc123def456
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "abc123def456",
      "title": "React 入门教程",
      "content": "完整的文章内容...",
      "summary": "这是一篇关于React的入门教程",
      "author": "管理员",
      "category": "技术",
      "tags": "React,JavaScript",
      "status": "published",
      "viewCount": 101,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**错误响应 (404)**:
```json
{
  "success": false,
  "message": "文章不存在"
}
```

---

### 4. 更新文章

**接口地址**: `PUT /api/admin/article/[id]`

**描述**: 根据文章ID更新文章信息

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 文章ID |

#### 请求参数

```json
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "summary": "更新后的摘要",
  "author": "作者名称",
  "category": "分类名称",
  "tags": "标签1,标签2",
  "status": "published"
}
```

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| title | string | 否 | 文章标题 |
| content | string | 否 | 文章内容 |
| summary | string | 否 | 文章摘要 |
| author | string | 否 | 作者名称 |
| category | string | 否 | 文章分类 |
| tags | string | 否 | 标签 |
| status | string | 否 | 文章状态 |

#### 特殊逻辑

- 当 `status` 更新为 "published" 且文章之前没有发布时间时，会自动设置 `publishedAt` 为当前时间
- 每次更新都会自动更新 `updatedAt` 字段

#### 响应示例

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "abc123def456",
      "title": "更新后的标题",
      "content": "更新后的内容",
      "summary": "更新后的摘要",
      "author": "管理员",
      "category": "技术",
      "tags": "React,JavaScript",
      "status": "published",
      "viewCount": 100,
      "publishedAt": "2024-01-02T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    },
    "message": "博客文章更新成功"
  }
}
```

**错误响应 (404)**:
```json
{
  "success": false,
  "message": "文章不存在"
}
```

---

### 5. 删除文章

**接口地址**: `DELETE /api/admin/article/[id]`

**描述**: 根据文章ID删除文章

#### 路径参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 文章ID |

#### 请求示例

```
DELETE /api/admin/article/abc123def456
```

#### 响应示例

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "message": "博客文章删除成功",
    "deletedId": "abc123def456"
  }
}
```

**错误响应 (404)**:
```json
{
  "success": false,
  "message": "文章不存在"
}
```

## 错误码说明

| HTTP状态码 | 描述 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript/TypeScript 示例

```typescript
// 创建文章
const createArticle = async (articleData: any) => {
  const response = await fetch('/api/admin/article', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(articleData),
  });
  return response.json();
};

// 获取文章列表
const getArticleList = async (params: any) => {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`/api/admin/article/list?${searchParams}`);
  return response.json();
};

// 获取文章详情
const getArticleDetail = async (id: string) => {
  const response = await fetch(`/api/admin/article/${id}`);
  return response.json();
};

// 更新文章
const updateArticle = async (id: string, updateData: any) => {
  const response = await fetch(`/api/admin/article/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  return response.json();
};

// 删除文章
const deleteArticle = async (id: string) => {
  const response = await fetch(`/api/admin/article/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
```

 