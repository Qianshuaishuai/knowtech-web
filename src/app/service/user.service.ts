import {
  Injectable
} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';

// tslint:disable-next-line:import-blacklist
import {
  Observable, from
} from 'rxjs';

// import 'rxjs/add/operator/toPromise';

import {
  HttpClientService
} from './http-client.service';

import {
  UserResponse
} from '../response/user-response'
import { CommonResponse } from '../response/common-response';

@Injectable()
export class UserService {

  constructor(
    private httpClientService: HttpClientService,
    private http: HttpClient
  ) { }

  /**
   * 登录
   *
   */
  login(phone: string, password: string): Observable<CommonResponse> {
    const params = new HttpParams()
      .set('phone', String(phone))
      .set('password', String(password))

    return this.httpClientService.getRequest<CommonResponse>('v1/user/login', 0, {
      params: params
    });
  }

  /**
   * 注册
   *
   */
  register(phone: string, password: string,code: string): Observable<CommonResponse> {
    const params = new HttpParams()
      .set('phone', phone)
      .set('password', password)
      .set('code', code)

    return this.httpClientService.post<CommonResponse>('v1/user/register', null, 0, params);
  }

  /**
   * 修改密码
   *
   */
  forget(phone: string, password: string, code: string): Observable<CommonResponse> {
    const params = new HttpParams()
      .set('phone', phone)
      .set('password', password)
      .set('code', code)

    return this.httpClientService.post<CommonResponse>('v1/user/forget', null, 0, params);
  }


  /**
  * 获取用户信息
  *
  */
  get(phone: string): Observable<UserResponse> {
    const params = new HttpParams()
      .set('phone', String(phone))

    return this.httpClientService.getRequest<UserResponse>('v1/user/get', 0, {
      params: params
    });
  }

  /**
   * 获取验证玛
   *
   */
  code(phone: string) {
    const params = new HttpParams()
      .set('phone', String(phone))

    return this.httpClientService.post<CommonResponse>('v1/user/code', null, 0, params);
  }

  /**
   * 登出
   *
   */
  logout(phone: string) {
    const params = new HttpParams()
      .set('phone', String(phone))

    return this.httpClientService.post<CommonResponse>('v1/user/logout', null, 0, params);
  }

}
