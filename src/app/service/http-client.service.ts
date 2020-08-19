import { Injectable } from '@angular/core';
import { BASE_URL, BASE_URL_BEIKE } from '../constants';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LoaderService } from './loader.service';
import { catchError, tap, finalize } from 'rxjs/operators';

@Injectable()
export class HttpClientService {

  private teacherId: string;
  private accessToken: string;
  apiSign: any;

  constructor(
    private httpClient: HttpClient,
    private loaderService: LoaderService,
  ) { }

  /**
   * get 请求
   *
   * @param url 请求接口 url 
   * @param isHideLoader 是否隐藏加载进度条
   * @param type 调用 base url 类型
   * @param options 参数
   */
  get<T>(url: string, isHideLoader: boolean, type: number, options?: {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    this.showLoader();

    return this.httpClient.get<T>(this.getFullUrl(url, type), options)
      .pipe(
        catchError(this.onCatch),
        tap((res: T) => {
          this.onSuccess<T>(res);
        }, (error: any) => {
          this.onError(error);
        }),
        finalize(() => {
          if (isHideLoader) {
            this.onEnd();
          }
        }));

  }

  /**
   * get 请求
   *
   * @param url 请求接口 url
   * @param type 调用 base url 类型
   * @param options 参数
   */
  getRequest<T>(url: string, type: number, options?: {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.httpClient.get<T>(this.getFullUrl(url, type), options)
      .pipe(
        catchError(this.onCatch),
        tap((res: T) => {
          this.onSuccess<T>(res);
        }, (error: any) => {
          this.onError(error);
        }),
        finalize(() => {
        }));
  }

  post<T>(url: string, body: any | null, type: number, params?: HttpParams): Observable<T> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/x-www-form-urlencoded');

    return this.httpClient.post<T>(this.getFullUrl(url, type), body, {
      params: params,
      headers: headers,
    });
  }

  postFile<T>(url: string, body: any | null, type: number): Observable<T> {
    return this.httpClient.post<T>(this.getFullUrl(url, type), body)
  }



  /**
   * 获取完整 url
   *
   * @param url 请求接口 url
   * @param type 表示不同 API 0 表示 BASE_URL; 1 表示 BASE_URL_BEIKE
   */
  private getFullUrl(url: string, type: number): string {
    if (type === 0) {
      return BASE_URL + url;
    } else if (type === 1) {
      return BASE_URL_BEIKE + url;
    }
  }

  private onCatch(error: any, caught: Observable<any>): Observable<any> {
    return Observable.throw(error);
  }

  private onSuccess<T>(response: T): void {
    // console.log('Request successful');
  }

  private onError(res: Response): void {
    console.log('Error, status code: ' + res.status);
  }

  private onEnd(): void {
    this.hideLoader();
  }

  private showLoader(): void {
    this.loaderService.show();
  }

  private hideLoader(): void {
    this.loaderService.hide();
  }

  private getParamsObj(params): Object {
    const paramsObj = new Object;
    params['updates'].forEach((v) => {
      if (v['value']) {
        const key = v['param'];
        const value = v['value'];
        paramsObj[key] = value;
      }
    });
    return paramsObj;
  }

}
