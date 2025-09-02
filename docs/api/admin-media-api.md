# 媒体管理接口文档

## 概述

媒体管理接口提供了对系统中媒体文件的查询、批量标签设置和批量删除功能。所有接口都位于 `/api/admin/media` 路径下。

## 接口列表

### 1. 查询媒体文件 (GET)

**接口地址：** `GET /api/admin/media`

**功能描述：** 管理员查询媒体文件接口，支持分页和多条件查询

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| type | string | 否 | 媒体文件MIME类型 | `image/jpeg` |
| mediaType | string | 否 | 媒体类型：image或video | `image` |
| category | string | 否 | 标签分类（单个分类查询） | `portrait` |
| supabaseId | string | 否 | 用户ID | `user_123` |
| recordId | string | 否 | 记录ID | `record_456` |
| page | number | 否 | 页码，默认为1 | `1` |
| pageSize | number | 否 | 每页数量，默认为10，最大100 | `20` |

#### 请求示例

```bash
# 基础查询
GET /api/admin/media?page=1&pageSize=10

# 按媒体类型查询
GET /api/admin/media?mediaType=image&page=1&pageSize=20

# 按用户ID和分类查询
GET /api/admin/media?supabaseId=user_123&category=portrait&page=1&pageSize=10

# 多条件查询
GET /api/admin/media?type=image/jpeg&mediaType=image&category=landscape&page=2&pageSize=15
```

#### 响应格式

**成功响应 (200):**

```json
{
  "success": true,
  "message": "查询媒体文件成功",
  "data": {
    "medias": [
      {
        "id": "media_123",
        "supabaseId": "user_456",
        "recordId": "record_789",
        "taskId": "task_101",
        "url": "https://example.com/media/image.jpg",
        "type": "image/jpeg",
        "mediaType": "image",
        "aspectRatio": "16/9",
        "uploadSource": "user_upload",
        "category": ["portrait", "professional"],
        "meta": {
          "width": 1920,
          "height": 1080,
          "size": 245760
        },
        "isDelete": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 10,
    "totalPages": 15
  }
}
```

**无数据响应 (200):**

```json
{
  "success": true,
  "message": "未找到媒体文件",
  "data": {
    "medias": [],
    "total": 0,
    "page": 1,
    "pageSize": 10,
    "totalPages": 0
  }
}
```

**错误响应 (500):**

```json
{
  "success": false,
  "message": "查询媒体文件失败",
  "data": null
}
```

### 2. 批量设置标签 (PATCH)

**接口地址：** `PATCH /api/admin/media`

**功能描述：** 批量设置媒体文件的标签category

#### 请求参数

**Content-Type:** `application/json`

| 参数名 | 类型 | 必填 | 描述 | 限制 |
|--------|------|------|------|------|
| mediaIds | string[] | 是 | 媒体文件ID数组 | 最多100个 |
| category | string[] | 是 | 要设置的标签数组 | 无限制 |

#### 请求示例

```bash
PATCH /api/admin/media
Content-Type: application/json

{
  "mediaIds": ["media_123", "media_456", "media_789"],
  "category": ["portrait", "professional", "high-quality"]
}
```

#### 响应格式

**成功响应 (200):**

```json
{
  "success": true,
  "message": "成功更新3个媒体文件的标签",
  "data": {
    "updatedCount": 3,
    "updatedIds": ["media_123", "media_456", "media_789"],
    "category": ["portrait", "professional", "high-quality"]
  }
}
```

**参数错误响应 (400):**

```json
{
  "success": false,
  "message": "mediaIds参数无效，必须是非空数组",
  "data": null
}
```

```json
{
  "success": false,
  "message": "category参数无效，必须是数组",
  "data": null
}
```

```json
{
  "success": false,
  "message": "posterUrl参数仅适用于视频类型的媒体文件",
  "data": null
}
```

```json
{
  "success": false,
  "message": "aspectRatio格式无效，必须是 n/m 格式（如：16/9、4/3）",
  "data": null
}
```

```json
{
  "success": false,
  "message": "aspectRatio的分子和分母都必须大于0",
  "data": null
}
```

```json
{
  "success": false,
  "message": "批量操作数量不能超过100个",
  "data": null
}
```

**服务器错误响应 (500):**

```json
{
  "success": false,
  "message": "批量设置标签失败",
  "data": null
}
```

### 3. 编辑媒体文件 (PUT)

**接口地址：** `PUT /api/admin/media`

**功能描述：** 编辑单个媒体文件的信息，支持更新标签、宽高比类型和用户ID

#### 请求参数

**Content-Type:** `application/json`

| 参数名 | 类型 | 必填 | 描述 | 限制 |
|--------|------|------|------|------|
| id | string | 是 | 媒体文件ID | 必须是有效的媒体文件ID |
| category | string[] | 否 | 标签分类数组 | 可选，数组类型 |
| aspectRatio | string | 否 | 宽高比类型 | 可选，必须是 n/m 格式（如：16/9、4/3），分子分母都必须大于0 |
| supabaseId | string | 否 | 用户ID | 可选，字符串类型 |
| posterUrl | string | 否 | 视频封面图片URL | 仅适用于视频类型的媒体文件，存储到meta字段中 |

**注意：** 
- 至少需要提供 `category`、`aspectRatio`、`supabaseId` 或 `posterUrl` 中的一个字段进行更新
- `posterUrl` 参数仅适用于视频类型的媒体文件，如果对图片类型媒体使用此参数将返回错误

#### 请求示例

```bash
PUT /api/admin/media
Content-Type: application/json

# 更新标签
{
  "id": "media_123",
  "category": ["portrait", "professional", "high-quality"]
}

# 更新宽高比
{
  "id": "media_123",
  "aspectRatio": "16/9"
}

# 更新用户ID
{
  "id": "media_123",
  "supabaseId": "new_user_456"
}

# 更新视频封面
{
  "id": "media_123",
  "posterUrl": "https://example.com/poster.jpg"
}

# 同时更新多个字段
{
  "id": "media_123",
  "category": ["landscape", "nature"],
  "aspectRatio": "4/3",
  "supabaseId": "user_789"
}
```

#### 响应格式

**成功响应 (200):**

```json
{
  "success": true,
  "message": "媒体文件信息更新成功",
  "data": {
    "media": {
      "id": "media_123",
      "supabaseId": "user_789",
      "recordId": "record_456",
      "taskId": "task_101",
      "url": "https://example.com/media/image.jpg",
      "type": "image/jpeg",
      "mediaType": "image",
      "aspectRatio": "4/3",
      "uploadSource": "user_upload",
      "category": ["landscape", "nature"],
      "meta": {
        "width": 1920,
        "height": 1080,
        "size": 245760
      },
      "isDelete": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    },
    "updatedFields": {
      "category": ["landscape", "nature"],
      "aspectRatio": "4/3",
      "supabaseId": "user_789"
    }
  }
}
```

**参数错误响应 (400):**

```json
{
  "success": false,
  "message": "id参数无效，必须是非空字符串",
  "data": null
}
```

```json
{
  "success": false,
  "message": "至少需要提供一个要更新的字段（category、aspectRatio、supabaseId或posterUrl）",
  "data": null
}
```

```json
{
  "success": false,
  "message": "category参数无效，必须是数组",
  "data": null
}
```

**媒体文件不存在响应 (404):**

```json
{
  "success": false,
  "message": "媒体文件不存在或已被删除",
  "data": null
}
```

**服务器错误响应 (500):**

```json
{
  "success": false,
  "message": "编辑媒体文件失败",
  "data": null
}
```

### 4. 批量删除媒体文件 (DELETE)

**接口地址：** `DELETE /api/admin/media`

**功能描述：** 批量删除媒体文件（软删除，设置isDelete=true）

#### 请求参数

**Content-Type:** `application/json`

| 参数名 | 类型 | 必填 | 描述 | 限制 |
|--------|------|------|------|------|
| mediaIds | string[] | 是 | 要删除的媒体文件ID数组 | 最多100个 |

#### 请求示例

```bash
DELETE /api/admin/media
Content-Type: application/json

{
  "mediaIds": ["media_123", "media_456", "media_789"]
}
```

#### 响应格式

**成功响应 (200):**

```json
{
  "success": true,
  "message": "成功删除3个媒体文件",
  "data": {
    "deletedCount": 3,
    "deletedIds": ["media_123", "media_456", "media_789"],
    "deletedUrls": [
      "https://example.com/media/image1.jpg",
      "https://example.com/media/image2.jpg",
      "https://example.com/media/video1.mp4"
    ]
  }
}
```

**参数错误响应 (400):**

```json
{
  "success": false,
  "message": "mediaIds参数无效，必须是非空数组",
  "data": null
}
```

```json
{
  "success": false,
  "message": "批量操作数量不能超过100个",
  "data": null
}
```

**服务器错误响应 (500):**

```json
{
  "success": false,
  "message": "批量删除媒体文件失败",
  "data": null
}
```

## 数据模型

### Media 媒体文件模型

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | string | 媒体文件唯一标识符 |
| supabaseId | string | 用户ID |
| recordId | string | 关联记录ID |
| taskId | string | 关联任务ID |
| url | string | 媒体文件URL |
| type | string | 媒体文件MIME类型 |
| mediaType | "image" \| "video" | 媒体类型 |
| aspectRatio | string | 宽高比 |
| uploadSource | string | 上传来源 |
| category | string[] | 标签分类数组 |
| meta | object | 媒体文件元数据 |
| isDelete | boolean | 是否已删除 |
| createdAt | string | 创建时间（ISO格式） |
| updatedAt | string | 更新时间（ISO格式） |

## 使用注意事项

1. **分页限制：** 每页最大查询数量为100条记录
2. **批量操作限制：** 批量设置标签和批量删除操作最多支持100个媒体文件
3. **软删除：** 删除操作为软删除，只设置isDelete标志，不会物理删除文件
4. **查询过滤：** 默认查询时会过滤掉已删除的媒体文件（isDelete=true）
5. **时间排序：** 查询结果按创建时间倒序排列
6. **标签查询：** category参数支持单个分类查询，使用数组包含匹配

## 错误码说明

| HTTP状态码 | 描述 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

## 示例代码

### JavaScript/TypeScript 示例

```typescript
// 查询媒体文件
async function queryMedias(params: {
  mediaType?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(`/api/admin/media?${searchParams}`);
  return await response.json();
}

// 批量设置标签
async function batchSetCategory(mediaIds: string[], category: string[]) {
  const response = await fetch('/api/admin/media', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mediaIds, category }),
  });
  return await response.json();
}

// 编辑媒体文件
async function editMedia(params: {
  id: string;
  category?: string[];
  aspectRatio?: string;
  supabaseId?: string;
  posterUrl?: string;
}) {
  const response = await fetch('/api/admin/media', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return await response.json();
}

// 批量删除媒体文件
async function batchDeleteMedias(mediaIds: string[]) {
  const response = await fetch('/api/admin/media', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mediaIds }),
  });
  return await response.json();
}
```

### cURL 示例

```bash
# 查询媒体文件
curl -X GET "http://localhost:3000/api/admin/media?mediaType=image&page=1&pageSize=10"

# 批量设置标签
curl -X PATCH "http://localhost:3000/api/admin/media" \
  -H "Content-Type: application/json" \
  -d '{
    "mediaIds": ["media_123", "media_456"],
    "category": ["portrait", "professional"]
  }'

# 编辑媒体文件
curl -X PUT "http://localhost:3000/api/admin/media" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "media_123",
    "category": "portrait",
    "aspectRatio": "9/16",
    "supabaseId": "user_789",
    "posterUrl": "https://example.com/poster.jpg"
  }'

# 为视频添加封面图片
curl -X PUT "http://localhost:3000/api/admin/media" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "video_456",
    "posterUrl": "https://example.com/video-poster.jpg"
  }'

# 批量删除媒体文件
curl -X DELETE "http://localhost:3000/api/admin/media" \
  -H "Content-Type: application/json" \
  -d '{
    "mediaIds": ["media_123", "media_456"]
  }'
```