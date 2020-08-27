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

import { CommonResponse } from '../response/common-response';
import { BookListResponse } from '../response/book-list-response'
import { BookDetailResponse } from '../response/book-detail-response'

@Injectable()
export class BookService {

  constructor(
    private httpClientService: HttpClientService,
    private http: HttpClient
  ) { }

  /**
   * 添加新书本
   *
   */
  addBook(userId: string, bookData: string): Observable<CommonResponse> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('bookData', bookData)

    return this.httpClientService.post<CommonResponse>('v1/book/add', null, 0, params);
  }

  /**
   * 添加新书本
   *
   */
  editBook(userId: string,bookId: string, bookData: string): Observable<CommonResponse> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('bookId', bookId)
      .set('bookData', bookData)

    return this.httpClientService.post<CommonResponse>('v1/book/edit', null, 0, params);
  }


  /**
   * 删除书本
   *
   */
  deleteBook(bookId: string): Observable<CommonResponse> {
    const params = new HttpParams()
      .set('bookId', bookId)

    return this.httpClientService.post<CommonResponse>('v1/book/delete', null, 0, params);
  }

  /**
  * 获取书本列表
  *
  */
  getList(userId: string, limit: string, page: string, sort: string, q: string): Observable<BookListResponse> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('limit', limit)
      .set('page', page)
      .set('sort', sort)
      .set('q', q)

    return this.httpClientService.getRequest<BookListResponse>('v1/book/list', 0, {
      params: params
    });
  }

  /**
  * 获取书本详情
  *
  */
  getDetail(bookId: string): Observable<BookDetailResponse> {
    const params = new HttpParams()
      .set('bookId', bookId)

    return this.httpClientService.getRequest<BookDetailResponse>('v1/book/detail', 0, {
      params: params
    });
  }
}
