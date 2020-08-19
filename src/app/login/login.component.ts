import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from '../service/user.service'
import { MessageService } from '../service/message.service';

import {
  Subscription,
} from 'rxjs';

import {
  OK_RESPONSE_NUMBER,
} from '../../app/constants'

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  //管控当前用户操作卡片状态:1为登录，2为注册，3为修改密码
  moduleIndex = 1

  //登录卡片相关变量
  loginPhone = ""
  loginPassword = ""

  //注册卡片相关变量
  registerCodeStr = ""
  registerPhone = ""
  registerPassword = ""
  registerAgainPassword = ""

  //找回密码相关变量
  forgetCodeStr = ""
  forgetPhone = ""
  forgetPassword = ""
  forgetAgainPassword = ""

  unClickTime = 0
  timer: any

  userSubscription: Subscription

  constructor(private location: Location,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,) { }

  ngOnInit() {
  }

  //登录操作
  login(){

  }

  //跳转注册
  register(){
    
  }

  //忘记密码
  forget(){

  }

  //切换模块
  changeModule(index){
    this.moduleIndex = index
  }

  //发送验证码 type为1是注册，2是修改密码
  sendCode(type){
    var phoneStr = ""
    if(type == 1){
      phoneStr = this.registerPhone
    }else{
      phoneStr = this.forgetPhone
    }
    this.userSubscription = this.userService.code(phoneStr).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.messageService.sendPromptMessage("获取成功")
        this.startUnClickTime()
      } else {
        this.messageService.sendPromptMessage(response.F_responseMsg)
      }
    });
    
  }

  //验证码倒计时
  startUnClickTime() {
    this.unClickTime = 60

    this.timer = setInterval(() => {

      this.unClickTime = this.unClickTime -1

      if (this.unClickTime<=0){
        clearInterval(this.timer)
      }
  
    },1000);
  }
}
