import { refreshToken as apiRefreshToken } from '@/api/index'
export const logout = () => {
  window.localStorage.removeItem('accessToken')
  window.localStorage.removeItem('refreshToken')
}
export const refreshToken = () => {
  return apiRefreshToken({ refreshToken: window.localStorage.getItem('refreshToken') }).then((res) => {
    const { access_token: accessToken, refresh_token: refreshToken } = res
    window.localStorage.setItem('accessToken', accessToken)
    window.localStorage.setItem('refreshToken', refreshToken)
  })
}
