import { create } from 'zustand'
import { TestResult, User } from '../types'
import { api, setAuthToken, getAuthToken, CreateResultData } from '../services/api'

interface AppStore {
  // 用户状态
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  
  // 认证方法
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  
  // 测试结果
  results: TestResult[]
  addResult: (result: TestResult) => void
  saveResultToServer: (result: TestResult) => Promise<boolean>
  fetchResultsFromServer: () => Promise<void>
  deleteResult: (id: string) => Promise<boolean>
  clearResults: () => void
  
  // 当前测试状态
  currentAnswers: Map<number, number>
  setAnswer: (questionId: number, value: number) => void
  clearAnswers: () => void
  
  // 初始化
  loadFromStorage: () => void
  saveToStorage: () => void
  clearError: () => void
}

const STORAGE_KEY = 'psycho_test_data'

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  token: null,
  results: [],
  currentAnswers: new Map(),
  isLoading: false,
  error: null,
  
  setUser: (user) => {
    set({ user })
    get().saveToStorage()
  },
  
  // 用户登录
  login: async (username, password) => {
    set({ isLoading: true, error: null })
    const response = await api.auth.login(username, password)
    
    if (response.success && response.data) {
      const { user, token } = response.data
      setAuthToken(token)
      set({ user, token, isLoading: false })
      get().saveToStorage()
      // 登录后从服务器获取历史结果
      get().fetchResultsFromServer()
      return true
    } else {
      set({ 
        isLoading: false, 
        error: response.error?.message || '登录失败' 
      })
      return false
    }
  },
  
  // 用户注册
  register: async (username, email, password) => {
    set({ isLoading: true, error: null })
    const response = await api.auth.register(username, email, password)
    
    if (response.success && response.data) {
      const { user, token } = response.data
      setAuthToken(token)
      set({ user, token, isLoading: false })
      get().saveToStorage()
      return true
    } else {
      set({ 
        isLoading: false, 
        error: response.error?.message || '注册失败' 
      })
      return false
    }
  },
  
  // 退出登录
  logout: () => {
    setAuthToken(null)
    set({ user: null, token: null, results: [] })
    localStorage.removeItem(STORAGE_KEY)
  },
  
  // 添加结果（本地 + 服务器）
  addResult: (result) => {
    const newResults = [...get().results, result]
    set({ results: newResults })
    get().saveToStorage()
    // 如果已登录，同步到服务器
    if (get().user) {
      get().saveResultToServer(result)
    }
  },
  
  // 保存结果到服务器
  saveResultToServer: async (result) => {
    const data: CreateResultData = {
      scaleId: result.scaleId,
      scaleName: result.scaleName,
      answers: result.answers,
      totalScore: result.totalScore,
      level: result.level,
      levelDescription: result.levelDescription,
    }
    
    const response = await api.results.create(data)
    
    if (response.success && response.data) {
      // 更新本地结果的 ID 为服务器返回的 ID
      const results = get().results.map(r => 
        r.id === result.id ? { ...r, id: response.data!.id } : r
      )
      set({ results })
      get().saveToStorage()
      return true
    }
    return false
  },
  
  // 从服务器获取结果
  fetchResultsFromServer: async () => {
    if (!get().user) return
    
    set({ isLoading: true })
    const response = await api.results.getAll()
    
    if (response.success && response.data) {
      set({ results: response.data.results, isLoading: false })
      get().saveToStorage()
    } else {
      set({ isLoading: false })
    }
  },
  
  // 删除结果
  deleteResult: async (id) => {
    const response = await api.results.delete(id)
    
    if (response.success) {
      const results = get().results.filter(r => r.id !== id)
      set({ results })
      get().saveToStorage()
      return true
    }
    return false
  },
  
  clearResults: () => {
    set({ results: [] })
    get().saveToStorage()
  },
  
  setAnswer: (questionId, value) => {
    const newAnswers = new Map(get().currentAnswers)
    newAnswers.set(questionId, value)
    set({ currentAnswers: newAnswers })
  },
  
  clearAnswers: () => {
    set({ currentAnswers: new Map() })
  },
  
  clearError: () => {
    set({ error: null })
  },
  
  loadFromStorage: () => {
    try {
      // 恢复 token
      const token = getAuthToken()
      if (token) {
        set({ token })
      }
      
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        set({
          user: parsed.user || null,
          results: parsed.results || [],
        })
        
        // 如果有 token，尝试从服务器刷新数据
        if (token && parsed.user) {
          get().fetchResultsFromServer()
        }
      }
    } catch (e) {
      console.error('Failed to load from storage:', e)
    }
  },
  
  saveToStorage: () => {
    try {
      const { user, results } = get()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, results }))
    } catch (e) {
      console.error('Failed to save to storage:', e)
    }
  },
}))
