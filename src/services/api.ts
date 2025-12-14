// API 服务层 - 用于与后端通信

import { TestResult, User } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// API 响应类型
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

interface PaginatedResponse<T> {
  results: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface AuthResponse {
  user: User
  token: string
}

interface StatsOverview {
  totalTests: number
  scaleStats: {
    scaleId: string
    scaleName: string
    count: number
    averageScore: number
    latestScore: number
    trend: 'improving' | 'stable' | 'declining'
  }[]
  recentActivity: {
    date: string
    count: number
  }[]
}

interface TrendData {
  scaleId: string
  scaleName: string
  dataPoints: {
    date: string
    score: number
    level: string
  }[]
}

// Token 管理
let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token')
  }
  return authToken
}

// 通用请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: '请求失败',
        },
      }
    }
    
    return data
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查网络后重试',
      },
    }
  }
}

// ============ 认证接口 ============

export const authApi = {
  // 用户注册
  register: (username: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  // 用户登录
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // 获取当前用户信息
  getCurrentUser: () => request<User>('/auth/me'),
}

// ============ 测试结果接口 ============

export interface CreateResultData {
  scaleId: string
  scaleName: string
  answers: number[]
  totalScore: number
  level: string
  levelDescription: string
}

export interface GetResultsParams {
  scaleId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export const resultsApi = {
  // 保存测试结果
  create: (data: CreateResultData) =>
    request<TestResult>('/results', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取所有测试结果
  getAll: (params?: GetResultsParams) => {
    const searchParams = new URLSearchParams()
    if (params?.scaleId) searchParams.set('scaleId', params.scaleId)
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    
    const query = searchParams.toString()
    return request<PaginatedResponse<TestResult>>(`/results${query ? `?${query}` : ''}`)
  },

  // 获取单个测试结果
  getById: (id: string) => request<TestResult>(`/results/${id}`),

  // 删除测试结果
  delete: (id: string) =>
    request<{ message: string }>(`/results/${id}`, {
      method: 'DELETE',
    }),

  // 批量删除测试结果
  deleteMany: (ids: string[]) =>
    request<{ message: string }>('/results', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
}

// ============ 统计接口 ============

export const statsApi = {
  // 获取统计概览
  getOverview: () => request<StatsOverview>('/stats/overview'),

  // 获取量表趋势数据
  getTrend: (scaleId: string, days?: number) => {
    const params = days ? `?days=${days}` : ''
    return request<TrendData>(`/stats/trend/${scaleId}${params}`)
  },
}

// 导出所有 API
export const api = {
  auth: authApi,
  results: resultsApi,
  stats: statsApi,
}

export default api
