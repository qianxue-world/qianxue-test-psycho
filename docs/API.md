# 心理测试平台 API 文档

## 概述

本文档描述了心理测试平台的后端 API 接口规范，用于保存和管理用户测试结果。

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

---

## 认证接口

### 用户注册

```
POST /auth/register
```

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_string"
  }
}
```

### 用户登录

```
POST /auth/login
```

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_string"
  }
}
```

### 获取当前用户信息

```
GET /auth/me
```

**Headers**:
```
Authorization: Bearer <token>
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 测试结果接口

### 保存测试结果

```
POST /results
```

**Headers**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "scaleId": "string",
  "scaleName": "string",
  "answers": [1, 2, 3, 2, 1],
  "totalScore": 45,
  "level": "轻度",
  "levelDescription": "您的症状处于轻度水平"
}
```

**响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "scaleId": "string",
    "scaleName": "string",
    "answers": [1, 2, 3, 2, 1],
    "totalScore": 45,
    "level": "轻度",
    "levelDescription": "您的症状处于轻度水平",
    "completedAt": "2024-01-01T00:00:00.000Z",
    "userId": "string"
  }
}
```

### 获取用户所有测试结果

```
GET /results
```

**Headers**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| scaleId | string | 否 | 按量表ID筛选 |
| startDate | string | 否 | 开始日期 (ISO 8601) |
| endDate | string | 否 | 结束日期 (ISO 8601) |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "string",
        "scaleId": "string",
        "scaleName": "string",
        "answers": [1, 2, 3, 2, 1],
        "totalScore": 45,
        "level": "轻度",
        "levelDescription": "您的症状处于轻度水平",
        "completedAt": "2024-01-01T00:00:00.000Z",
        "userId": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 获取单个测试结果

```
GET /results/:id
```

**Headers**:
```
Authorization: Bearer <token>
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "scaleId": "string",
    "scaleName": "string",
    "answers": [1, 2, 3, 2, 1],
    "totalScore": 45,
    "level": "轻度",
    "levelDescription": "您的症状处于轻度水平",
    "completedAt": "2024-01-01T00:00:00.000Z",
    "userId": "string"
  }
}
```

### 删除测试结果

```
DELETE /results/:id
```

**Headers**:
```
Authorization: Bearer <token>
```

**响应** (200 OK):
```json
{
  "success": true,
  "message": "测试结果已删除"
}
```

### 批量删除测试结果

```
DELETE /results
```

**Headers**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

**响应** (200 OK):
```json
{
  "success": true,
  "message": "已删除 3 条测试结果"
}
```

---

## 统计接口

### 获取用户测试统计

```
GET /stats/overview
```

**Headers**:
```
Authorization: Bearer <token>
```

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalTests": 25,
    "scaleStats": [
      {
        "scaleId": "sds",
        "scaleName": "抑郁自评量表",
        "count": 5,
        "averageScore": 42,
        "latestScore": 38,
        "trend": "improving"
      }
    ],
    "recentActivity": [
      {
        "date": "2024-01-01",
        "count": 2
      }
    ]
  }
}
```

### 获取特定量表的历史趋势

```
GET /stats/trend/:scaleId
```

**Headers**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| days | number | 否 | 查询天数，默认 30 |

**响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "scaleId": "sds",
    "scaleName": "抑郁自评量表",
    "dataPoints": [
      {
        "date": "2024-01-01",
        "score": 45,
        "level": "轻度"
      },
      {
        "date": "2024-01-15",
        "score": 38,
        "level": "正常"
      }
    ]
  }
}
```

---

## 错误响应

所有接口在发生错误时返回统一格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息"
  }
}
```

### 错误码说明

| HTTP 状态码 | 错误码 | 说明 |
|-------------|--------|------|
| 400 | INVALID_REQUEST | 请求参数无效 |
| 401 | UNAUTHORIZED | 未认证或 token 无效 |
| 403 | FORBIDDEN | 无权限访问该资源 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | CONFLICT | 资源冲突（如用户名已存在） |
| 422 | VALIDATION_ERROR | 数据验证失败 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

---

## 数据模型

### User

```typescript
interface User {
  id: string
  username: string
  email?: string
  createdAt: string  // ISO 8601
}
```

### TestResult

```typescript
interface TestResult {
  id: string
  scaleId: string
  scaleName: string
  answers: number[]
  totalScore: number
  level: string
  levelDescription: string
  completedAt: string  // ISO 8601
  userId: string
}
```

### CreateResultRequest

```typescript
interface CreateResultRequest {
  scaleId: string
  scaleName: string
  answers: number[]
  totalScore: number
  level: string
  levelDescription: string
}
```

---

## 环境配置

前端需要配置 API 基础地址：

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

生产环境：

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```
