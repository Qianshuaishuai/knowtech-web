import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from '../service/user.service'
import { MessageService } from '../service/message.service';
import { ElMessageService } from 'element-angular'

import {
  Subscription,
} from 'rxjs';

import {
  OK_RESPONSE_NUMBER,
} from '../../app/constants'

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass']
})
export class UserComponent implements OnInit {

  searchStr = ""

  userTip = "欢迎默认用户"

  modelIndex = 1

  userSubscription: Subscription

  constructor(private location: Location,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private message: ElMessageService, ) { }

  ngOnInit() {
    this.initUserTip()
  }

  initUserTip(){
    const phone = this.messageService.getPhoneMessage()
    if(phone){
      this.userTip = "欢迎" + phone + "用户"
    }
  }

  modelChange(event){
    this.modelIndex = event
  }

  logout(){
    this.userSubscription = this.userService.logout(this.messageService.getPhoneMessage()).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("登出成功")
        this.messageService.setLoginMessage(false)
        this.messageService.setPhoneMessage("")
        this.router.navigate([`../login/`], { relativeTo: this.route });
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }
}
