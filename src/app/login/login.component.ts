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

  //图形验证码相关
  verifyCodeStr = ""
  base64: SafeUrl
  verifyCodeValue: string
  cv = new CodeValidator({
    width:160,
    height:30,
    length:4
  })

  //加载框相关
  loading = false
  loadingTip = "登录中"

  userSubscription: Subscription

  constructor(private location: Location,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private message: ElMessageService,
    private sanitizer: DomSanitizer ) { }

  ngOnInit() {
    this.checkIsLogin()
    this.randomVerifyCode()
  }

  randomVerifyCode() {
    let res = this.cv.random()
    this.base64 = this.sanitizer.bypassSecurityTrustUrl(res.base)
    this.verifyCodeValue = res.value
  }

  checkIsLogin() {
    const phone = this.messageService.getPhoneMessage()
 
    if (phone) {
      this.router.navigate([`../user/`], { relativeTo: this.route });
    }
  }

  //登录操作
  login() {
    if (this.loginPhone == "") {
      this.message['warning']("手机号不能为空")
      return
    }
    if (this.loginPassword == "") {
      this.message['warning']("密码不能为空")
      return
    }

    if(this.verifyCodeStr != this.verifyCodeValue){
      this.message['error']("图形验证码错误")
      this.randomVerifyCode()
      return
    }

    this.userSubscription = this.userService.login(this.loginPhone, this.loginPassword).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("登录成功")
        this.router.navigate([`../user/`], { relativeTo: this.route });
        this.messageService.setLoginMessage(true)
        this.messageService.setPhoneMessage(this.loginPhone)
        this.messageService.setUserInfo(response.F_data)
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }

  //注册
  register() {
    if (this.registerPhone == "") {
      this.message['warning']("手机号不能为空")
      return
    }
    if (this.registerPassword == "") {
      this.message['warning']("密码不能为空")
      return
    }

    if (this.registerCodeStr == "") {
      this.message['warning']("验证玛不能为空")
      return
    }

    if (this.registerPassword != this.registerAgainPassword) {
      this.message['warning']("两次密码不一样")
      return
    }

    this.userSubscription = this.userService.register(this.registerPhone, this.registerPassword, this.registerCodeStr).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("注册成功")
        this.messageService.setLoginMessage(true)
        this.messageService.setPhoneMessage(this.registerPhone)
        this.router.navigate([`../user/`], { relativeTo: this.route });
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }

  //忘记密码
  forget() {
    if (this.forgetPhone == "") {
      this.message['warning']("手机号不能为空")
      return
    }
    if (this.forgetPassword == "") {
      this.message['warning']("新密码不能为空")
      return
    }

    if (this.forgetCodeStr == "") {
      this.message['warning']("验证玛不能为空")
      return
    }

    if (this.forgetPassword != this.forgetAgainPassword) {
      this.message['warning']("两次密码不一样")
      return
    }

    this.userSubscription = this.userService.forget(this.forgetPhone, this.forgetPassword, this.forgetCodeStr).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("修改成功")
        this.changeModule(1)
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }

  //切换模块
  changeModule(index) {
    this.moduleIndex = index
  }

  //发送验证码 type为2是注册，3是修改密码
  sendCode(type) {
    var phoneStr = ""
    if (type == 2) {
      phoneStr = this.registerPhone
    } else {
      phoneStr = this.forgetPhone
    }
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

  //开关加载框
  openLoading(tip) {
    this.loading = true
    this.loadingTip = tip
  }

  closeLoading() {
    this.loading = false
  }
}
