import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from '../service/user.service'
import { MessageService } from '../service/message.service';
import { ElMessageService } from 'element-angular'
import { CodeValidator } from "code-validator"
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import {
  Subscription,
} from 'rxjs';

import {
  OK_RESPONSE_NUMBER,Subjects,Grades
} from '../../app/constants'

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {

  //页面状态管理相关
  currentModule = 2

  subjects = Subjects
  grades = Grades
  isSelectGrade = false

  //注册信息
  registerGrade = { "name": "", "value": 0 }
  registerName = ""
  registerPhone = ""
  registerCodeStr = ""
  registerPassword = ""
  registerAgainPassword = ""
  registerAddress = ""
  registerOrgan = ""
  registerIntroduce = ""

  //验证码相关
  unClickTime = 0
  timer: any

  userSubscription: Subscription

  //忘记密码相关


  constructor(private location: Location,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private message: ElMessageService,
    private sanitizer: DomSanitizer ) { }

  ngOnInit() {
    this.currentModule = this.route.snapshot.params['moduleId'];
  }

  selectSubject(index){
    this.subjects[index].status = !this.subjects[index].status
  }

  showSelectGrade(){
    this.isSelectGrade = true
  }

  selectGrade(index){
    this.isSelectGrade = false
    this.registerGrade = this.grades[index]
  }

   //发送验证码
   sendCode(type) {
    var phoneStr = this.registerPhone
    if (phoneStr == "") {
      this.message['warning']("手机号不能为空")
      return
    }
    this.userSubscription = this.userService.code(phoneStr).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("获取成功")
        this.startUnClickTime()
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });

  }

   //验证码倒计时
   startUnClickTime() {
    this.unClickTime = 60

    this.timer = setInterval(() => {

      this.unClickTime = this.unClickTime - 1

      if (this.unClickTime <= 0) {
        clearInterval(this.timer)
      }

    }, 1000);
  }

  changeModule(index){
    this.currentModule = index
  }

  cancelRegister(){
    this.location.back()
  }

  cancelForget(){
    this.location.back()
  }
}
