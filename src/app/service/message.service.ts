import { Injectable } from '@angular/core';
import { Subject, Observable, SubscriptionLike } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable()
export class MessageService {

    constructor(private storageService: StorageService) { }

    promptMessageSubject: Subject<string> = new Subject();

    sendPromptMessage(message: string) {
        this.promptMessageSubject.next(message);
    }

    getPromptMessage(): Observable<string> {
        return this.promptMessageSubject.asObservable();
    }
}
