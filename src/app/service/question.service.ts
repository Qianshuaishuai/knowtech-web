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
import { QuestionListResponse } from '../response/question-list-response'
import { QuestionDetailResponse } from '../response/question-detail-response'

@Injectable()
export class QuestionService {

    constructor(
        private httpClientService: HttpClientService,
        private http: HttpClient
    ) { }

    /**
     * 添加新题目
     *
     */
    addQuestion(userId: string, questionData: string): Observable<CommonResponse> {
        const params = new HttpParams()
            .set('userId', userId)
            .set('questionData', questionData)

        return this.httpClientService.post<CommonResponse>('v1/question/add', null, 0, params);
    }

    /**
     * 添加新题目
     *
     */
    editQuestion(userId: string, questionId: string, questionData: string): Observable<CommonResponse> {
        const params = new HttpParams()
            .set('userId', userId)
            .set('questionId', questionId)
            .set('questionData', questionData)

        return this.httpClientService.post<CommonResponse>('v1/question/edit', null, 0, params);
    }


    /**
     * 删除题目
     *
     */
    deleteQuestion(questionId: string): Observable<CommonResponse> {
        const params = new HttpParams()
            .set('questionId', questionId)

        return this.httpClientService.post<CommonResponse>('v1/question/delete', null, 0, params);
    }

    /**
    * 获取题目列表
    *
    */
    getList(userId: string, limit: string, page: string, sort: string, q: string): Observable<QuestionListResponse> {
        const params = new HttpParams()
            .set('userId', userId)
            .set('limit', limit)
            .set('page', page)
            .set('sort', sort)
            .set('q', q)

        return this.httpClientService.getRequest<QuestionListResponse>('v1/question/list', 0, {
            params: params
        });
    }

    /**
    * 获取题目详情
    *
    */
    getDetail(questionId: string): Observable<QuestionDetailResponse> {
        const params = new HttpParams()
            .set('questionId', questionId)

        return this.httpClientService.getRequest<QuestionDetailResponse>('v1/question/detail', 0, {
            params: params
        });
    }
}
