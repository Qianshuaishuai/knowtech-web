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

  //loading相关
  loadingStatus = false

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

  //画布相关
  isShowFrame = false
  canvas: any;
  canvasPen: any;
  frameWidth = '1400px'
  frameHeight = '800px'
  canvasWidth = 1400
  canvasHeight = 800
  isCanvasMouseDown = false
  currentStartX = 0
  currentStartY = 0
  currentEndX = 0
  currentEndY = 0
  rectDatas = new Array()
  readySrc = ""

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
      this.message['error']('请给当前页面先选好图片')
      return
    }

    this.isShowFrame = true
    this.readySrc = this.operatQuestion.image
    this.drawCanvas()
  }

  //删除截图框
  deleteFrame(frameIndex) {
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

    for(var f=0;f<this.operatQuestion.frames.length;f++){
      var frame = this.operatQuestion.frames[f]
      if (!frame.resourceUrl) {
        this.message['warning']("有截图框的资源还未选择")
        return false
      }
    }

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
      this.editQuestion(userId, questionId)
    } else {
      this.addQuestion(userId)
    }
    this.loadingStatus = true
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
      this.loadingStatus = false
    });
  }

  editQuestion(userId, questionId) {
    this.questionSubscription = this.questionService.editQuestion(String(userId), String(questionId), JSON.stringify(this.operatQuestion)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("更改成功")
        this.modelIndex = 1
        this.operatQuestion = new Question()
        this.getQuestionList()
      } else {
        this.message['error'](response.F_responseMsg)
      }
      this.loadingStatus = false
    });
  }

  //另起画布用于裁剪
  drawCanvas() {
    this.canvas = document.getElementById('canvas');
    this.canvasPen = this.canvas.getContext("2d");
    var img = new Image()
    img.src = this.readySrc
    var that = this
    img.onload = function () {
      var imgWidth = img.width
      var imgHeight = img.height

      if (imgWidth > 1000 || imgHeight > 1000) {
        imgWidth = imgWidth / 3
        imgHeight = imgHeight / 3
      }

      that.frameWidth = imgWidth + "px"
      that.frameHeight = imgHeight + "px"
      that.canvasWidth = imgWidth
      that.canvasHeight = imgHeight
    }

    // img.onload = function () {
    //   that.canvasPen.drawImage(img,0,0)
    // }

    //画布动作监听
    this.canvas.onmousedown = (e) => {
      e.preventDefault();
      that.isCanvasMouseDown = true
      that.currentStartX = e.offsetX
      that.currentStartY = e.offsetY
      console.log(e)
    }
    //鼠标按下，松开，移动，离开事件执行
    this.canvas.onmouseup = (e) => {
      e.preventDefault();
      that.isCanvasMouseDown = false
      // that.currentEndX = e.clientX
      // that.currentEndY = e.clientY
    }
    this.canvas.onmouseout = (e) => {
      e.preventDefault();
      that.isCanvasMouseDown = false
    }
    this.canvas.onmousemove = (e) => {
      e.preventDefault();
      if (that.isCanvasMouseDown) {
        that.currentEndX = e.offsetX
        that.currentEndY = e.offsetY
        // that.drawCanvasFrame(that.canvasPen)
        that.drawCanvasFrame(that.canvasPen)
      }
    }
  }


  drawCanvasFrame(ctx) {
    const startX = this.currentStartX
    const startY = this.currentStartY
    const endX = this.currentEndX
    const endY = this.currentEndY
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    ctx.strokeStyle = "red"
    ctx.strokeWidth = 1
    ctx.lineWidth = 1

    var rectWidth = Math.abs(startX - endX)
    var rectHeight = Math.abs(startY - endY)

    if (endX >= startX) {
      if (endY >= startY) {
        ctx.strokeRect(startX, startY, rectWidth, rectHeight);
      } else {
        ctx.strokeRect(startX, startY, rectWidth, -rectHeight);
      }
    } else {
      if (endY >= startY) {
        ctx.strokeRect(startX, startY, -rectWidth, rectHeight);
      } else {
        ctx.strokeRect(startX, startY, -rectWidth, -rectHeight);
      }
    }
  }

  frameCancel() {
    this.isShowFrame = false
  }

  frameReset() {
    this.canvas = document.getElementById('canvas');
    this.canvasPen = this.canvas.getContext("2d");
    this.canvasPen.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.currentStartX = 0
    this.currentStartY = 0
    this.currentEndX = 0
    this.currentEndY = 0
  }

  frameSure() {
    if (this.currentStartX == 0 && this.currentStartY == 0 && this.currentEndX == 0 && this.currentEndY == 0) {
      this.message['error']("请先进行截取框图")
      return
    }

    //判断是否与之前截图框重叠
    for(var f=0;f<this.operatQuestion.frames.length;f++){
      var frame = this.operatQuestion.frames[f]
      if (frame.position&&frame.position != "") {
        var positionObject = JSON.parse(frame.position)
        if (this.currentStartX == positionObject.x1 && this.currentStartY == positionObject.y1 && this.currentEndX == positionObject.x2 && this.currentEndY == positionObject.y2) {
          this.message['error']("此截框坐标与前面重叠！")
          return
        }
      }
    }

    this.isShowFrame = false
    var object = new Object({
      x1: this.currentStartX,
      y1: this.currentStartY,
      x2: this.currentEndX,
      y2: this.currentEndY
    })
    var newFrame = new Frame()
    newFrame.position = JSON.stringify(object)
    this.operatQuestion.frames.push(newFrame)
  }

  getPositionDetail(positionData) {
    if (!positionData || positionData == "") {
      return "未解析到截框坐标信息"
    }

    var positionObject = JSON.parse(positionData)
    return "(" + positionObject.x1 + "," + positionObject.y1 + ")和(" + positionObject.x2 + "," + positionObject.y2 + ")"
  }
}
