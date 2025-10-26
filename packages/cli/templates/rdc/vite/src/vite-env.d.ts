/// <reference types="vite/client" />

declare module '@waimai/waimai-qa-aie-utils' {
  import { AxiosRequestConfig } from 'axios';

  export interface ICreateAxiosOptions extends AxiosRequestConfig {
    authBaseURL?: string;
    transform?: any;
    requestOptions?: any;
  }

  export class AxiosHttp {
    constructor(options: ICreateAxiosOptions);
    getInstance(): import('axios').AxiosInstance;
  }
}
