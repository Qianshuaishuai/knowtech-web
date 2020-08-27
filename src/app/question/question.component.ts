import { Component, OnInit } from '@angular/core';
import { Question, Frame } from '../bean/question'
import { Grades, COS_APP_ID, COS_APP_SECRET, COS_BUCKET, COS_REGION, COS_STORAGE_CLASS } from '../constants'
import { ElMessageService } from 'element-angular'
import { QuestionService } from '../service/question.service'
import Random from '../util/random'
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import {
  Subscription,
} from 'rxjs';

import {
  OK_RESPONSE_NUMBER,
} from '../../app/constants'
import {
  UserInfo
} from '../bean/user'
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.sass']
})
export class QuestionComponent implements OnInit {

  //对话框相关
  deleteTip = false
  deleteIndex = 0

  //模块参数
  modelIndex = 1
  pageIndex = 1
  pageSize = 20
  totalCount = 0

  //题目数据
  operatQuestion = new Question
  grades = Grades
  searchStr = ""

  //网络相关
  userInfo = new UserInfo()
  questionList = new Array()
  cos
  questionSubscription: Subscription

  constructor(private message: ElMessageService,
    private questionService: QuestionService,
    private messageService: MessageService, ) {

  }

  ngOnInit() {
    this.initCOSUploadConfig()
    this.getUserInfo()
    this.getQuestionList()
  }

  getUserInfo() {
    this.userInfo = this.messageService.getUserInfo()
    this.userInfo.id = 3
  }

  initCOSUploadConfig() {
    this.cos = new COS({
      SecretId: COS_APP_ID,
      SecretKey: COS_APP_SECRET,
    });
  }

  dialogSure() {
    this.deleteTip = false
    this.questionSubscription = this.questionService.deleteQuestion(String(this.deleteIndex)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("删除成功")
        this.getQuestionList()
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }

  dialogCancel() {
    this.deleteTip = false
  }

  //编辑
  edit(scope) {
    const questionId = scope.rowData.id
    this.getQuestionDetail(questionId)
  }

  //删除
  delete(scope) {
    const questionId = scope.rowData.id
    this.deleteIndex = questionId
    this.deleteTip = true
  }

  //重置
  reset() {

  }

  //搜索
  search() {
    this.getQuestionList()
  }

  //获取用户题目列表
  getQuestionList() {
    this.questionSubscription = this.questionService.getList(String(this.userInfo.id), String(this.pageSize), String(this.pageIndex), '0', this.searchStr).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.questionList = response.F_data
        this.totalCount = response.F_count
      } else {
      }
    });
  }

  //获取用户题目详情
  getQuestionDetail(questionId) {
    this.questionSubscription = this.questionService.getDetail(String(questionId)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.operatQuestion = response.F_data
        this.modelIndex = 2
      } else {
      }
    });
  }

  //改变页码
  changePage(event) {
    this.pageIndex = event
    this.getQuestionList()
  }

  //Ai选择按钮触发
  changeAi(event) {
    this.operatQuestion.imageAi = event ? 1 : 0
  }

  //添加新题目
  addNewQuestion() {
    this.modelIndex = 2
    this.operatQuestion = new Question()
  }

  //返回上一级
  backQuestionTable() {
    this.modelIndex = 1
  }

  //上传框图资源
  uploadResource(event, frameIndex) {
    const keyName = new Date().getTime() + new Random().randomString(8);
    if (event) {
      var that = this
      this.cos.putObject({
        Bucket: COS_BUCKET, /* 必须 */
        Region: COS_REGION,     /* 存储桶所在地域，必须字段 */
        Key: keyName,              /* 必须 */
        StorageClass: COS_STORAGE_CLASS,
        Body: event[0], // 上传文件对象
      }, function (err, data) {
        if (err) {
          that.message['error']('上传失败，请联系管理员')
          return
        }

        that.message['success']('上传成功')
        var resourceUrl = "https://" + data.Location

        that.operatQuestion.frames[frameIndex].resourceUrl = resourceUrl
      });
    }
  }

  //选择图片后监听 
  uploadCover(event) {
    const keyName = new Date().getTime() + new Random().randomString(8);
    if (event) {
      var that = this
      this.cos.putObject({
        Bucket: COS_BUCKET, /* 必须 */
        Region: COS_REGION,     /* 存储桶所在地域，必须字段 */
        Key: keyName,              /* 必须 */
        StorageClass: COS_STORAGE_CLASS,
        Body: event[0], // 上传文件对象
      }, function (err, data) {
        if (err) {
          that.message['error']('上传失败，请联系管理员')
          return
        }

        that.message['success']('上传成功')
        var picUrl = "https://" + data.Location

        that.operatQuestion.image = picUrl
      });
    }

  }

  //触发选择图片
  clickUpload(type) {
    var id = "question-cover"
    switch (type) {
      case 1:
        id = "question-cover"
        break
      case 2:
        id = "page-cover"
        break
      case 3:
        id = "frame-resource"
        break
    }

    document.getElementById(id).click();
  }

  //增加新截图框
  addNewFrame(index) {
    if (!this.operatQuestion.image) {
      this.message['error']('请给当前题目先选好图片')
      return
    }
    this.operatQuestion.frames.push(new Frame())
  }

  //删除截图框
  deleteFrame(frameIndex){
    this.operatQuestion.frames.splice(frameIndex, 1)
  }

  //提交前的验证
  verifySubmit() {
    if (!this.operatQuestion.name) {
      this.message['warning']("题目名称不能为空")
      return false
    }

    if (!this.operatQuestion.image) {
      this.message['warning']("请先上传题目图片")
      return false
    }

    this.operatQuestion.frames.forEach(frame => {
      if (!frame.resourceUrl) {
        this.message['warning']("有截图框的资源还未选择")
        return false
      }
    });

    return true
  }

  //提交数据
  submit() {
    if (!this.verifySubmit()) {
      return true
    }
    const userId = this.userInfo.id
    if (userId == 0) {
      this.message['warning']("你还未登录")
      return
    }
    
    const questionId = this.operatQuestion.id
    //当questionId存在时为编辑，不存在为新建
    if (questionId && questionId != 0) {
      this.editQuestion(userId,questionId)
    } else {
      this.addQuestion(userId)
    }

    return
  }

  addQuestion(userId) {
    this.questionSubscription = this.questionService.addQuestion(String(userId), JSON.stringify(this.operatQuestion)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("新建成功")
        this.modelIndex = 1
        this.operatQuestion = new Question()
        this.getQuestionList()
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }

  editQuestion(userId,questionId){
    this.questionSubscription = this.questionService.editQuestion(String(userId),String(questionId), JSON.stringify(this.operatQuestion)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("更改成功")
        this.modelIndex = 1
        this.operatQuestion = new Question()
        this.getQuestionList()
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }

}
