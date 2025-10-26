import { AxiosHttp, ICreateAxiosOptions } from '@waimai/waimai-qa-aie-utils';
import { AxiosInstance } from 'axios';
import { getSpaceId } from '../../../../packages/utils/localStorage';

const config: ICreateAxiosOptions = {
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  authBaseURL: import.meta.env.VITE_AUTH_BASE_URL,
};

const axiosInstance: AxiosInstance = new AxiosHttp(config).getInstance();

// 添加请求拦截器，确保每次请求都使用最新的 spaceId
axiosInstance.interceptors.request.use((config) => {
  // 确保 headers 存在
  config.headers = config.headers || {};
  // 在每次请求时获取最新的 spaceId
  config.headers['Xc-SpaceId'] = getSpaceId();
  return config;
});

export default axiosInstance;
