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
  OK_RESPONSE_NUMBER, Subjects, Grades
} from '../../app/constants'

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {

  //页面状态管理相关
  currentModule = 1
  currentRealModule = 1

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
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.currentModule = this.route.snapshot.params['moduleId'];

    if (this.currentModule == 3) {
      this.currentRealModule = this.currentModule
      this.currentModule = 1

      var userInfo = this.messageService.getUserInfo()
      this.registerGrade = this.grades[userInfo.grade]
      this.registerName = userInfo.username
      this.registerPhone = userInfo.phone
      this.registerAddress = userInfo.address
      this.registerOrgan = userInfo.organ
      this.registerIntroduce = userInfo.introduce

      if (userInfo.subjects != "") {
        this.subjects.forEach(subject => {
          var selectSubjects = JSON.parse(userInfo.subjects)
          selectSubjects.forEach(selectSubject => {
            if (selectSubject == subject.id) {
              subject.status = true
            }
          });
        });
      }
    }
  }

  selectSubject(index) {
    this.subjects[index].status = !this.subjects[index].status
  }

  showSelectGrade() {
    this.isSelectGrade = true
  }

  selectGrade(index) {
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

  changeModule(index) {
    this.currentModule = index
  }

  cancelRegister() {
    this.location.back()
  }

  cancelForget() {
    this.location.back()
  }

  submit() {
    if (this.currentRealModule == 3) {
      this.setting()
    } else {
      this.register()
    }
  }

  //修改信息
  setting() {
    if (this.registerGrade.value == 0) {
      this.message['warning']("请先选择年级")
      return
    }

    if (this.registerOrgan == "") {
      this.message['warning']("所属机构/学校不能为空")
      return
    }

    if (this.registerAddress == "") {
      this.message['warning']("地区不能为空")
      return
    }

    if (this.registerIntroduce == "") {
      this.message['warning']("自我介绍不能为空")
      return
    }

    if (this.registerPassword != this.registerAgainPassword) {
      this.message['warning']("两次密码不一样")
      return
    }

    var selectSubjects = new Array()
    this.subjects.forEach(subject => {
      if (subject.status) {
        selectSubjects.push(subject.id)
      }
    });

    if (selectSubjects.length <= 0) {
      this.message['warning']("请先选择科目")
      return false
    }

    this.userSubscription = this.userService.setting(this.registerPhone, String(this.registerGrade.value), JSON.stringify(selectSubjects), this.registerOrgan, this.registerAddress, this.registerIntroduce).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("修改成功")
        this.messageService.setUserInfo(response.F_data)
        this.location.back()
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

    if (this.registerGrade.value == 0) {
      this.message['warning']("请先选择年级")
      return
    }

    if (this.registerOrgan == "") {
      this.message['warning']("所属机构/学校不能为空")
      return
    }

    if (this.registerAddress == "") {
      this.message['warning']("地区不能为空")
      return
    }

    if (this.registerIntroduce == "") {
      this.message['warning']("自我介绍不能为空")
      return
    }

    if (this.registerPassword != this.registerAgainPassword) {
      this.message['warning']("两次密码不一样")
      return
    }

    var selectSubjects = new Array()
    this.subjects.forEach(subject => {
      if (subject.status) {
        selectSubjects.push(subject.id)
      }
    });

    if (selectSubjects.length <= 0) {
      this.message['warning']("请先选择科目")
      return false
    }

    this.userSubscription = this.userService.register(this.registerName, this.registerPhone, this.registerPassword, this.registerCodeStr, String(this.registerGrade.value), JSON.stringify(selectSubjects), this.registerOrgan, this.registerAddress, this.registerIntroduce).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("注册成功")
        this.messageService.setLoginMessage(true)
        this.messageService.setPhoneMessage(this.registerPhone)
        this.messageService.setUserInfo(response.F_data)
        this.router.navigate([`../../user/`], { relativeTo: this.route });
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }
}
