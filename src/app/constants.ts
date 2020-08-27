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

//年级选择
export const Grades = [{ "name": "一年级", "value": 1 }, { "name": "二年级", "value": 2 }, { "name": "三年级", "value": 3 }, { "name": "四年级", "value": 4 }, { "name": "五年级", "value": 5 }, { "name": "六年级", "value": 6 }, { "name": "初一", "value": 7 }, { "name": "初二", "value": 8 }, { "name": "初三", "value": 9 }, { "name": "高一", "value": 10 }, { "name": "高二", "value": 11 }, { "name": "高三", "value": 12 }]

//COS相关
export const COS_APP_ID = "AKID3uWQ4RdQOnwq784pKI7i3g6LK4WihNTM"
export const COS_APP_SECRET = "sa86rNfLM9nI0TfhigPzKVdW92YpsjKf"
export const COS_BUCKET = "knowtech-1302822727"
export const COS_REGION = "ap-guangzhou"
export const COS_STORAGE_CLASS = "STANDARD"