/**
 * network request configuration
 */
import axios from 'axios'

axios.defaults.timeout = 100000
// axios.defaults.baseURL = 'http://localhost:5005'

/**
 * http request interceptor
 */
axios.interceptors.request.use(
  (config) => {
    config.data = JSON.stringify(config.data)
    config.headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * http response interceptor
 */
axios.interceptors.response.use(
  (response) => {
    if (response.data.errCode === 2) {
      console.log('expired, you need to login again')
    }
    return response
  },
  (error) => {
    console.log('request:', error)
    return Promise.reject(error);
  }
)
export default axios
