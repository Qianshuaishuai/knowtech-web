import { Injectable } from '@angular/core';
import { Subject, Observable, SubscriptionLike } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable()
export class MessageService {

    constructor(private storageService: StorageService) { }

    private isLogin = false

    promptMessageSubject: Subject<string> = new Subject();

    sendPromptMessage(message: string) {
        this.promptMessageSubject.next(message);
    }

    getPromptMessage(): Observable<string> {
        return this.promptMessageSubject.asObservable();
    }

    setLoginMessage(status: boolean): void {
        this.isLogin = status
    }

    getLoginMessage(): boolean {
        return this.isLogin;
    }

    setPhoneMessage(phone: string): void {
        this.storageService.write('phone', phone);
    }

    getPhoneMessage(): string {
        return this.storageService.read<string>('phone');
    }

}
