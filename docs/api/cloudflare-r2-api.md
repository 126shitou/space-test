# Cloudflare R2 文件管理 API 接口文档

本文档详细描述了用于管理 Cloudflare R2 存储桶的三个核心 API 接口：文件上传、文件列表和文件删除。

## 通用说明

### 响应格式

所有接口都使用统一的 `Result` 格式返回数据：

```typescript
// 成功响应
{
  "success": true,
  "data": any, // 具体数据
  "message": string // 可选的消息
}

// 失败响应
{
  "success": false,
  "message": string // 错误信息
}

## 1. 文件上传接口

### 基本信息

- **接口路径**: `/api/admin/cf/upload`
- **支持方法**: `GET`, `POST`

### GET 方法 - 获取上传配置

#### 请求

```http
GET /api/admin/cf/upload
```

#### 响应

```json
{
  "success": true,
  "data": {
    "maxFileSize": "100MB",
    "maxFileCount": 20,
    "supportedImageTypes": [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml"
    ],
    "supportedVideoTypes": [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv"
    ],
    "defaultPath": "uploads",
    "bucketName": "your-bucket-name",
    "features": {
      "skipExisting": true,
      "customFilenames": true,
      "customPath": true
    }
  }
}
```

### POST 方法 - 多文件上传

#### 请求

```http
POST /api/admin/cf/upload
Content-Type: multipart/form-data
```

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `files` | File[] | 是 | 要上传的文件数组，最少1个，最多20个 |
| `names` | string[] | 否 | 自定义文件名数组，与files数组对应 |
| `path` | string | 是 | 上传路径，不能为空 |
| `skipExisting` | boolean | 否 | 是否跳过已存在的文件，默认false |

#### 请求示例

```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('names', 'custom-name-1.jpg');
formData.append('names', 'custom-name-2.png');
formData.append('path', 'uploads/images');
formData.append('skipExisting', 'true');

fetch('/api/admin/cf/upload', {
  method: 'POST',
  body: formData
});
```

#### 响应

**全部成功 (200)**
```json
{
  "success": true,
  "data": {
    "totalFiles": 2,
    "successCount": 2,
    "errorCount": 0,
    "skippedCount": 0,
    "results": [
      {
        "filename": "custom-name-1.jpg",
        "originalName": "original1.jpg",
        "path": "uploads/images/custom-name-1.jpg",
        "size": 1024000,
        "contentType": "image/jpeg",
        "url": "https://pub-xxx.r2.dev/uploads/images/custom-name-1.jpg",
        "uploadTime": "2024-01-01T12:00:00.000Z",
        "etag": "abc123"
      }
    ],
    "errors": [],
    "message": "所有文件上传成功: 2/2"
  }
}
```

**部分成功 (207)**
```json
{
  "success": false,
  "message": "部分文件上传成功: 1/2",
  "data": {
    "totalFiles": 2,
    "successCount": 1,
    "errorCount": 1,
    "skippedCount": 0,
    "results": [/* 成功的文件信息 */],
    "errors": [
      {
        "filename": "file2.jpg",
        "error": "文件类型不支持",
        "index": 1,
        "skipped": false
      }
    ]
  }
}
```

**全部失败 (400/409)**
```json
{
  "success": false,
  "message": "所有文件上传失败",
  "data": {
    "totalFiles": 2,
    "successCount": 0,
    "errorCount": 2,
    "skippedCount": 0,
    "results": [],
    "errors": [/* 错误信息数组 */]
  }
}
```

---

## 2. 文件列表接口

### 基本信息

- **接口路径**: `/api/admin/cf/list`
- **支持方法**: `GET`, `POST`

### GET 方法 - 获取文件和目录列表

#### 请求

```http
GET /api/admin/cf/list?prefix=uploads&maxKeys=100&continuationToken=xxx
```

#### 查询参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `prefix` | string | 否 | "" | 路径前缀，用于获取特定目录下的内容 |
| `maxKeys` | number | 否 | 1000 | 最大返回数量 |
| `continuationToken` | string | 否 | - | 分页标记 |

#### 响应

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "key": "uploads/image1.jpg",
        "name": "image1.jpg",
        "size": 1024000,
        "lastModified": "2024-01-01T12:00:00.000Z",
        "etag": "abc123",
        "url": "https://pub-xxx.r2.dev/uploads/image1.jpg",
        "type": "file"
      }
    ],
    "directories": [
      {
        "key": "uploads/subfolder/",
        "name": "subfolder",
        "type": "directory"
      }
    ],
    "totalCount": 2,
    "prefix": "uploads",
    "continuationToken": "next-page-token",
    "isTruncated": false
  }
}
```

### POST 方法 - 批量获取文件详细信息

#### 请求

```http
POST /api/admin/cf/list
Content-Type: application/json
```

#### 请求体

```json
{
  "keys": [
    "uploads/file1.jpg",
    "uploads/file2.png"
  ]
}
```

#### 响应

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "key": "uploads/file1.jpg",
        "name": "file1.jpg",
        "size": 1024000,
        "lastModified": "2024-01-01T12:00:00.000Z",
        "etag": "abc123",
        "url": "https://pub-xxx.r2.dev/uploads/file1.jpg",
        "type": "file"
      }
    ],
    "errors": [
      "uploads/file2.png: 文件不存在"
    ],
    "totalRequested": 2,
    "successCount": 1,
    "errorCount": 1
  }
}
```

---

## 3. 文件删除接口

### 基本信息

- **接口路径**: `/api/admin/cf/delete`
- **支持方法**: `GET`, `DELETE`

### GET 方法 - 获取删除接口配置

#### 请求

```http
GET /api/admin/cf/delete
```

#### 响应

```json
{
  "success": true,
  "data": {
    "maxBatchSize": 100,
    "supportedMethods": ["single", "batch"],
    "bucketName": "your-bucket-name",
    "features": {
      "batchDelete": true,
      "singleDelete": true
    }
  }
}
```

### DELETE 方法 - 删除文件

#### 单个文件删除

**请求**
```http
DELETE /api/admin/cf/delete
Content-Type: application/json
```

**请求体**
```json
{
  "key": "uploads/file1.jpg"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "key": "uploads/file1.jpg",
    "message": "文件删除成功"
  }
}
```

#### 批量文件删除

**请求**
```http
DELETE /api/admin/cf/delete
Content-Type: application/json
```

**请求体**
```json
{
  "keys": [
    "uploads/file1.jpg",
    "uploads/file2.png",
    "uploads/file3.gif"
  ]
}
```

**响应**

**全部成功**
```json
{
  "success": true,
  "data": {
    "totalFiles": 3,
    "successCount": 3,
    "failureCount": 0,
    "results": [
      {
        "key": "uploads/file1.jpg",
        "success": true
      },
      {
        "key": "uploads/file2.png",
        "success": true
      },
      {
        "key": "uploads/file3.gif",
        "success": true
      }
    ],
    "message": "所有文件删除成功"
  }
}
```

**部分成功**
```json
{
  "success": false,
  "message": "部分文件删除成功: 2/3",
  "data": {
    "totalFiles": 3,
    "successCount": 2,
    "failureCount": 1,
    "results": [
      {
        "key": "uploads/file1.jpg",
        "success": true
      },
      {
        "key": "uploads/file2.png",
        "success": true
      },
      {
        "key": "uploads/file3.gif",
        "success": false,
        "error": "文件不存在"
      }
    ]
  }
}
```

---

## 错误处理

### 常见错误码

| HTTP状态码 | 描述 |
|------------|------|
| 200 | 请求成功 |
| 207 | 部分成功（批量操作） |
| 400 | 请求参数错误 |
| 409 | 冲突（如文件已存在） |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "message": "具体的错误信息"
}
```

---

## 使用示例

### JavaScript/TypeScript 示例

```typescript
// 1. 上传文件
async function uploadFiles(files: File[], path: string) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('path', path);
  formData.append('skipExisting', 'true');
  
  const response = await fetch('/api/admin/cf/upload', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

// 2. 获取文件列表
async function getFileList(prefix: string = '', maxKeys: number = 100) {
  const params = new URLSearchParams({
    prefix,
    maxKeys: maxKeys.toString()
  });
  
  const response = await fetch(`/api/admin/cf/list?${params}`);
  return await response.json();
}

// 3. 删除文件
async function deleteFiles(keys: string[]) {
  const response = await fetch('/api/admin/cf/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ keys })
  });
  
  return await response.json();
}
```

### React Hook 示例

```typescript
import { useState, useCallback } from 'react';

export function useCloudflareR2() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(async (files: File[], path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('path', path);
      
      const response = await fetch('/api/admin/cf/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '上传失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFileList = useCallback(async (prefix: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ prefix });
      const response = await fetch(`/api/admin/cf/list?${params}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取列表失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFiles = useCallback(async (keys: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/cf/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keys })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '删除失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    uploadFiles,
    getFileList,
    deleteFiles
  };
}
```

---

## 注意事项

1. **文件大小限制**: 单个文件最大 100MB
2. **批量操作限制**: 
   - 上传：单次最多 20 个文件
   - 删除：单次最多 100 个文件
3. **支持的文件类型**: 图片和视频文件，具体类型见配置接口返回
4. **路径规范**: 使用 `/` 作为路径分隔符
5. **并发处理**: 批量操作使用 Promise.all 并行处理
6. **错误处理**: 批量操作中的部分失败不会影响其他文件的处理
7. **分页支持**: 文件列表接口支持分页，使用 continuationToken 获取下一页

---

## 更新日志

- **v1.0.0**: 初始版本，支持文件上传、列表和删除功能
- 支持批量操作
- 统一的 Result 响应格式
- 完整的错误处理机制