import axios from 'axios'

const http = axios.create({
  baseURL: localStorage.getItem('base'),
})

export const useAxios = () => {
  return http
}
