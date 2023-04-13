import axios from "axios";
import {redirect} from "react-router-dom";

import config from '../config/app';

const instance = axios.create({
  baseURL: config.host,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json"
  }
});

instance.interceptors.request.use(
  (config) => {
    if (localStorage.getItem('token')) {
      config.headers.Authorization = "Bearer " + localStorage.getItem('token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

instance.interceptors.response.use(
  (response) => {
    console.log('response', response);
    return response.data;
  },
  (error) => {
    console.log('err', error)
    if (error.response && error.response.status === 401) {
      return redirect("/login");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
)

export const Api = {
  Get: (url, params, headers = {}) => {
    return instance.get(url, {
      params,
      headers
    });
  },
  Post: (url, params) => {
    return instance.post(url, params);
  },
}
