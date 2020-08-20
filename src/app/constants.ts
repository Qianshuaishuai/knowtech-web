import {
  environment
} from '../environments/environment';
/*
 *   Api地址
 */
// export const BASE_URL = environment.production ? 'http://api.360eliteclub.com/' : 'http://api.360eliteclub.com/';
// export const BASE_URL = environment.production ? 'http://apiq.qimsj.com/' : 'http://apiq.qimsj.com/';
export const BASE_URL = environment.production ? 'http://localhost:6490/' : 'http://localhost:6490/';
export const BASE_URL_BEIKE = environment.production ? 'https://api.qimsj.com/' : 'https://api.qimsj.com/';

//网络请求状态码
export const OK_RESPONSE_NUMBER = 10000;
export const ERROR_PARAMS_RESPONSE_NUMBER = 10002;
export const UNAUTHOR_STATUS_LOGIN_NUMBER = 12100;
export const ERROR_STATUS_LOGIN_NUMBER = 12105;
export const NO_RESOURCE_RESPONSE_NUMBER = 13300;
