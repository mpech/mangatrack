import { refreshToken as apiRefreshToken } from '/api'
export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}
export const refreshToken = () => {
  return apiRefreshToken({ refreshToken: localStorage.getItem('refreshToken') }).then((res) => {
    const { access_token: accessToken, refresh_token: refreshToken }  = res
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  })
}