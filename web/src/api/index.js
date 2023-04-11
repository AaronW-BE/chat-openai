import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json"
  }
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
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
