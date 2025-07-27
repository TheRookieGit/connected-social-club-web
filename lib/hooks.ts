import useSWR from 'swr'
import { User } from '@/types/user'

// 通用的用户数据同步函数
export const syncUserDataToLocalStorage = (newUserData: any, source: string = '') => {
  try {
    const currentUser = localStorage.getItem('user')
    if (currentUser && newUserData) {
      const userData = JSON.parse(currentUser)
      const updatedUserData = {
        ...userData,
        ...newUserData
      }
      localStorage.setItem('user', JSON.stringify(updatedUserData))
      console.log(`${source}: localStorage中的用户数据已更新:`, updatedUserData)
      return updatedUserData
    }
  } catch (error) {
    console.error(`${source}: 更新localStorage失败:`, error)
  }
  return null
}

// 带验证的 fetch 函数
async function fetchWithAuth(url: string) {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No token found')
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch')
  }

  return response.json()
}

export function useProfile() {
  const { data, error, mutate } = useSWR<{ success: boolean; user: any }>(
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
