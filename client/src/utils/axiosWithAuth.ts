import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from './constants';
import { log } from 'console';

const token = Cookies.get('access_token');

console.log('token', token);
console.log('API_BASE_URL', API_BASE_URL);


const axiosWithAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export default axiosWithAuth;
