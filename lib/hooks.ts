import useSWR from 'swr'
import { User } from '@/types/user'

// 数据获取函数
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No token found')

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...options.headers
    }
  })

  if (!response.ok) throw new Error('Failed to fetch')
  const data = await response.json()
  if (!data.success) throw new Error(data.error)
  
  return data
}

export function useProfile() {
  const { data, error, mutate } = useSWR<{ user: User }>(
    '/api/user/profile',
    fetchWithAuth,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1000
    }
  )

  return {
    user: data?.user,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

export function useRecommendedUsers() {
  const { data, error, mutate } = useSWR(
    '/api/user/matches?limit=10',
    fetchWithAuth,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1000
    }
  )

  return {
    users: data?.users || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
