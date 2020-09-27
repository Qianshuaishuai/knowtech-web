import { Component, OnInit } from '@angular/core';
import { Book, Page, Frame } from '../bean/book'
import { Grades, COS_APP_ID, COS_APP_SECRET, COS_BUCKET, COS_REGION, COS_STORAGE_CLASS } from '../constants'
import { ElMessageService } from 'element-angular'
import { BookService } from '../service/book.service'
import Random from '../util/random'
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import {
  Subscription,
} from 'rxjs';

import {
  OK_RESPONSE_NUMBER, Subjects
} from '../../app/constants'
import {
  UserInfo
} from '../bean/user'
import { MessageService } from '../service/message.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.sass']
})
export class BookComponent implements OnInit {

  //对话框相关
  deleteTip = false
  deleteIndex = 0
  isEditBook = false

  //loading相关
  loadingStatus = false

  //模块参数
  modelIndex = 1
  pageIndex = 1
  pageSize = 20
  totalCount = 0

  //书本数据
  operatBook = new Book
  grades = Grades
  searchStr = ""

  subjects = Subjects

  //网络相关
  userInfo = new UserInfo()
  bookList = new Array()
  cos
  bookSubscription: Subscription

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
  scale = 1
  rectDatas = new Array()
  readySrc = ""
  currentPageIndex = 0

  //新增画布逻辑相关
  sureImage = new Image()
  deleteImage = new Image()
  uploadImage = new Image()
  currentSureImageStartX = 0
  currentSureImageStartY = 0
  currentSureImageEndX = 0
  currentSureImageEndY = 0
  isSureStatus = false
  currentFrameIndex = 0

  cacheFrameX1 = 0
  cacheFrameX2 = 0
  cacheFrameY1 = 0
  cacheFrameY2 = 0

  constructor(private message: ElMessageService,
    private bookService: BookService,
    private messageService: MessageService, ) {

  }

  ngOnInit() {
    this.initCOSUploadConfig()
    this.getUserInfo()
    this.getBookList()
    this.initCanvasImage()
    this.drawCanvas()
  }

  initCanvasImage() {
    this.sureImage.src = "../../assets/user/sure.png"
    this.deleteImage.src = "../../assets/user/delete-frame.png"
    this.uploadImage.src = "../../assets/user/upload.png"
    this.canvas = document.getElementById('canvas');
    this.canvasPen = this.canvas.getContext("2d");
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

  getSubjectName(id){
    var subjectName = ""
    this.subjects.forEach(subject => {
      if(id == subject.id){
        subjectName = subject.value
      }
    });

    if(subjectName == ""){
      subjectName = "未知科目"
    }
    return subjectName
  }

  selectSubject(index) {
    this.subjects.forEach(element => {
      element.status = false
    });
    this.subjects[index].status = true
  }

  dialogSure() {
    this.deleteTip = false

    this.bookSubscription = this.bookService.deleteBook(String(this.deleteIndex)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("删除成功")
        this.getBookList()
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
    const bookId = scope.id
    this.getBookDetail(bookId)
  }

  //删除
  delete(scope) {
    const bookId = scope.id
    this.deleteIndex = bookId
    this.deleteTip = true
  }

  //重置
  reset() {

  }

  //搜索
  search() {
    this.getBookList()
  }

  //获取用户书本列表
  getBookList() {
    this.bookSubscription = this.bookService.getList(String(this.userInfo.id), String(this.pageSize), String(this.pageIndex), '0', this.searchStr).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.bookList = response.F_data
        this.totalCount = response.F_count
      } else {
      }
    });
  }

  //获取用户书本详情
  getBookDetail(bookId) {
    this.bookSubscription = this.bookService.getDetail(String(bookId)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.operatBook = response.F_data
        this.isEditBook = true
        this.subjects.forEach(subject => {
          if(subject.id == this.operatBook.subject){
            subject.status = true
          }
        });
      } else {
      }
    });
  }

  //改变页码
  changePage(event) {
    this.pageIndex = event
    this.getBookList()
  }

  //改变年级
  changeGrade(event) {
    this.operatBook.grade = event
  }

  //Ai选择按钮触发
  changeAi(event) {
    this.operatBook.imageAi = event ? 1 : 0
  }

  //日期选择
  selectDate(event) {
    this.operatBook.pubDate = event
  }

  //清除日期
  clearDate(event) {
    this.operatBook.pubDate = ""
  }

  //图片上传成功回调
  successHandle(event) {

  }

  //图片上传失败回调
  errorHandle(event) {

  }

  //添加新书本
  addNewBook() {
    // this.modelIndex = 2
    this.operatBook = new Book()
    this.isEditBook = true
  }

  //返回上一级
  backBookTable() {
    this.modelIndex = 1
  }

  //添加新书页
  addNewPage() {
    this.operatBook.pages.push(new Page())
  }

  //上传框图资源
  uploadResource(event) {
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

        that.operatBook.pages[that.currentPageIndex].frames[that.currentFrameIndex].resourceUrl = resourceUrl
        that.drawCanvasFrame()
      });
    }
  }

  cancelEditBook() {
    this.isEditBook = false
  }

  //选择图片后监听 
  //type:1为书本，2为书页，3为截图框
  //index:当type为2和3时使用的数组索引
  uploadCover(event, type, index) {
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

        switch (type) {
          case 1:
            that.operatBook.cover = picUrl
            break
          case 2:
            that.operatBook.pages[index].cover = picUrl
            break
          case 3:
            break
        }
      });
    }

  }

  //触发选择图片
  clickUpload(type) {
    var id = "book-cover"
    switch (type) {
      case 1:
        id = "book-cover"
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
    if (!this.operatBook.pages[index].cover) {
      this.message['error']('请给当前页面先选好图片')
      return
    }

    this.isShowFrame = true
    this.currentPageIndex = index
    this.readySrc = this.operatBook.pages[index].cover
    this.drawCanvas()
  }

  //删除书页
  deletePage(index) {
    this.operatBook.pages.splice(index, 1)
  }

  //删除截图框
  deleteFrame(pageIndex, frameIndex) {
    this.operatBook.pages[pageIndex].frames.splice(frameIndex, 1)
  }

  //提交前的验证
  verifySubmit() {
    if (!this.operatBook.name) {
      this.message['warning']("书本名称不能为空")
      return false
    }

    if (!this.operatBook.press) {
      this.message['warning']("出版社不能为空")
      return false
    }

    if (this.operatBook.grade == 0) {
      this.message['warning']("请先选择年级")
      return false
    }

    var subjectIsSelect = false
    this.subjects.forEach(subject => {
      if (subject.status) {
        subjectIsSelect = true
        this.operatBook.subject = subject.id
      }
    });

    if (!subjectIsSelect) {
      this.message['warning']("请先选择科目")
      return false
    }

    if (!this.operatBook.pubDate) {
      this.message['warning']("请先选择出版日期")
      return false
    }

    if (!this.operatBook.cover) {
      this.message['warning']("请先上传书本封面")
      return false
    }

    // this.operatBook.pages.forEach(page => {
    //   if (!page.cover) {
    //     this.message['warning']("有书页的图片还未上传")
    //     return false
    //   }

    //   page.frames.forEach(frame => {
    //     if (!frame.resourceUrl) {
    //       this.message['warning']("有截图框的资源还未选择")
    //       return false
    //     }
    //   });
    // });

    for (var p = 0; p < this.operatBook.pages.length; p++) {
      if (!this.operatBook.pages[p].cover) {
        this.message['warning']("有书页的图片还未上传")
        return false
      }
      for (var f = 0; f < this.operatBook.pages[p].frames.length; f++) {
        if (!this.operatBook.pages[p].frames[f].resourceUrl) {
          this.message['warning']("有截图框的资源还未选择")
          return false
        }
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

    const bookId = this.operatBook.id
    //当bookId存在时为编辑，不存在为新建
    if (bookId && bookId != 0) {
      this.editBook(userId, bookId)
    } else {
      this.addBook(userId)
    }
    this.loadingStatus = true
    return
  }

  addBook(userId) {
    this.bookSubscription = this.bookService.addBook(String(userId), JSON.stringify(this.operatBook)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("新建成功")
        this.isEditBook = false
        this.isShowFrame = false
        this.operatBook = new Book()
        this.getBookList()
      } else {
        this.message['error'](response.F_responseMsg)
      }
      this.loadingStatus = false
    });
  }

  editBook(userId, bookId) {
    this.bookSubscription = this.bookService.editBook(String(userId), String(bookId), JSON.stringify(this.operatBook)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("更改成功")
        this.isEditBook = false
        this.isShowFrame = false
        this.operatBook = new Book()
        this.getBookList()
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
        that.scale = 3
      }

      that.frameWidth = imgWidth + "px"
      that.frameHeight = imgHeight + "px"
      that.canvasWidth = imgWidth
      that.canvasHeight = imgHeight

      that.initCanvasFrame()
    }

    // img.onload = function () {
    //   that.canvasPen.drawImage(img,0,0)
    // }

    //画布动作监听
    this.canvas.onmousedown = (e) => {
      e.preventDefault();
      if (this.judgeIsInUpload(e.offsetX, e.offsetY)) {
        return
      }
      if (this.judgeIsInDelete(e.offsetX, e.offsetY)) {
        return
      }
      this.judgeIsInSure(e.offsetX, e.offsetY)
      if (!this.isSureStatus) {
        that.isCanvasMouseDown = true
        that.currentStartX = e.offsetX
        that.currentStartY = e.offsetY
      }
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
      if (that.isCanvasMouseDown && !that.isSureStatus) {
        that.currentEndX = e.offsetX
        that.currentEndY = e.offsetY
        // that.drawCanvasFrame(that.canvasPen)
        that.drawCanvasFrame()
      }
    }
  }

  initCanvasFrame(){
    const ctx = this.canvas.getContext("2d");

    const startX = this.currentStartX
    const startY = this.currentStartY
    const endX = this.currentEndX
    const endY = this.currentEndY

    this.cacheFrameX1 = this.currentStartX
    this.cacheFrameY1 = this.currentStartY
    this.cacheFrameX2 = this.currentEndX
    this.cacheFrameY2 = this.currentEndY

    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    ctx.strokeStyle = "red"
    ctx.strokeWidth = 1
    ctx.lineWidth = 1

    var rectWidth = Math.abs(startX - endX)
    var rectHeight = Math.abs(startY - endY)

    //先绘制先前的
    if (this.operatBook.pages[this.currentPageIndex]) {
      this.operatBook.pages[this.currentPageIndex].frames.forEach(frame => {
        var position = JSON.parse(frame.position)
        var x1 = position.x1
        var y1 = position.y1
        var x2 = position.x2
        var y2 = position.y2
        var rectWidth1 = Math.abs(x1 - x2)
        var rectHeight1 = Math.abs(y1 - y2)
        
        ctx.strokeRect(x1, y1, rectWidth1, rectHeight1);
        ctx.drawImage(this.deleteImage, x1 + rectWidth1 - 16, y1 - 16)

        if (frame.resourceUrl && frame.resourceUrl != "") {
          ctx.font = 'bold 24px Arial'
          ctx.fillStyle = "#1883D3";

          ctx.fillText("已上传资源", x1 + rectWidth1 / 2 - 64, y1 + rectHeight1 / 2 + 8);
        } else {
          ctx.drawImage(this.uploadImage, x1 + rectWidth1 / 2 - 32, y1 + rectHeight1 / 2 - 32)
        }

      });
    }

  }

  judgeIsInUpload(x, y) {

    for (var i = 0; i < this.operatBook.pages[this.currentPageIndex].frames.length; i++) {
      var frame = this.operatBook.pages[this.currentPageIndex].frames[i]
      var position = JSON.parse(frame.position)
      var x1 = position.x1
      var y1 = position.y1
      var x2 = position.x2
      var y2 = position.y2
      var rectWidth1 = Math.abs(x1 - x2)
      var rectHeight1 = Math.abs(y1 - y2)

      var uploadX1 = x1 + rectWidth1 / 2 - 32
      var uploadY1 = y1 + rectHeight1 / 2 - 32
      var uploadX2 = x1 + rectWidth1 / 2 + 32
      var uploadY2 = y1 + rectHeight1 / 2 + 32
      if (x <= uploadX2 && x >= uploadX1 && y <= uploadY2 && y >= uploadY1) {
        if (!(frame.resourceUrl && frame.resourceUrl != "")) {
          var id = "frame-resource"
          document.getElementById(id).click();
          this.currentFrameIndex = i
          return true
        }
      }
    }

    return false
  }

  judgeIsInDelete(x, y) {

    for (var i = 0; i < this.operatBook.pages[this.currentPageIndex].frames.length; i++) {
      var frame = this.operatBook.pages[this.currentPageIndex].frames[i]
      var position = JSON.parse(frame.position)
      var x1 = position.x1
      var y1 = position.y1
      var x2 = position.x2
      var y2 = position.y2
      var rectWidth1 = Math.abs(x1 - x2)
      var rectHeight1 = Math.abs(y1 - y2)
      var deleteX1 = x1 + rectWidth1 - 16
      var deleteY1 = y1 - 16
      var deleteX2 = x1 + rectWidth1 + 16
      var deleteY2 = y1 + 16
      if (x <= deleteX2 && x >= deleteX1 && y <= deleteY2 && y >= deleteY1) {
        this.operatBook.pages[this.currentPageIndex].frames.splice(i, 1)
        this.drawCanvasFrame()
        return true
      }
    }

    return false
  }

  judgeIsInSure(x, y) {
    if (x <= this.currentSureImageEndX && x >= this.currentSureImageStartX && y <= this.currentSureImageEndY && y >= this.currentSureImageStartY) {
      this.isSureStatus = true
      this.frameSure()
    } else {
      this.isSureStatus = false
    }
  }

  drawCanvasFrame() {

    const ctx = this.canvasPen 

    const startX = this.currentStartX
    const startY = this.currentStartY
    const endX = this.currentEndX
    const endY = this.currentEndY

    this.cacheFrameX1 = this.currentStartX
    this.cacheFrameY1 = this.currentStartY
    this.cacheFrameX2 = this.currentEndX
    this.cacheFrameY2 = this.currentEndY

    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    ctx.strokeStyle = "red"
    ctx.strokeWidth = 1
    ctx.lineWidth = 1

    var rectWidth = Math.abs(startX - endX)
    var rectHeight = Math.abs(startY - endY)

    //先绘制先前的
    if (this.operatBook.pages[this.currentPageIndex]) {
      this.operatBook.pages[this.currentPageIndex].frames.forEach(frame => {
        var position = JSON.parse(frame.position)
        var x1 = position.x1
        var y1 = position.y1
        var x2 = position.x2
        var y2 = position.y2
        var rectWidth1 = Math.abs(x1 - x2)
        var rectHeight1 = Math.abs(y1 - y2)
        
        ctx.strokeRect(x1, y1, rectWidth1, rectHeight1);
        ctx.drawImage(this.deleteImage, x1 + rectWidth1 - 16, y1 - 16)

        if (frame.resourceUrl && frame.resourceUrl != "") {
          ctx.font = 'bold 24px Arial'
          ctx.fillStyle = "#1883D3";

          ctx.fillText("已上传资源", x1 + rectWidth1 / 2 - 64, y1 + rectHeight1 / 2 + 8);
        } else {
          ctx.drawImage(this.uploadImage, x1 + rectWidth1 / 2 - 32, y1 + rectHeight1 / 2 - 32)
        }

      });
    }


    if (endX >= startX) {
      if (endY >= startY) {
        ctx.strokeRect(startX, startY, rectWidth, rectHeight);
      } else {
        ctx.strokeRect(startX, startY, rectWidth, -rectHeight);
      }
      if (!(startX == 0 && endY == 0)) {
        ctx.drawImage(this.sureImage, startX + rectWidth - 16, startY - 16)

        this.currentSureImageStartX = startX + rectWidth - 16
        this.currentSureImageStartY = startY - 16
        this.currentSureImageEndX = startX + rectWidth + 16
        this.currentSureImageEndY = startY + 16
      }

    } else {
      if (endY >= startY) {
        ctx.strokeRect(startX, startY, -rectWidth, rectHeight);
      } else {
        ctx.strokeRect(startX, startY, -rectWidth, -rectHeight);
      }

      if (!(startX == 0 && endY == 0)) {
        ctx.drawImage(this.sureImage, startX - rectWidth - 16, startY - 16)
        this.currentSureImageStartX = startX - rectWidth - 16
        this.currentSureImageStartY = startY - 16
        this.currentSureImageEndX = startX - rectWidth + 16
        this.currentSureImageEndY = startY + 16
      }

    }


  }

  frameCancel() {
    // this.frameReset()
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
    this.operatBook.pages[this.currentPageIndex].frames.splice(0, this.operatBook.pages[this.currentPageIndex].frames.length)
  }

  frameNewSure() {
    this.isShowFrame = false
  }

  frameSure() {
    if (this.currentStartX == 0 && this.currentStartY == 0 && this.currentEndX == 0 && this.currentEndY == 0) {
      this.message['error']("请先进行截取框图")
      return
    }

    //判断是否与之前截图框重叠
    for (var f = 0; f < this.operatBook.pages[this.currentPageIndex].frames.length; f++) {
      var frame = this.operatBook.pages[this.currentPageIndex].frames[f]
      var positionObject = JSON.parse(frame.position)
      if (this.currentStartX == positionObject.x1 && this.currentStartY == positionObject.y1 && this.currentEndX == positionObject.x2 && this.currentEndY == positionObject.y2) {
        this.message['error']("此截框坐标与前面重叠！")
        return
      }
    }

    var readStartX = this.cacheFrameX1
    var readStartY = this.cacheFrameY1
    var readEndX = this.cacheFrameX2
    var readEndY = this.cacheFrameY2

    if (readStartX > readEndX) {
      var middleX = readEndX
      readEndX = readStartX
      readStartX = middleX
    }

    if (readStartY > readEndY) {
      var middleY = readEndY
      readEndY = readStartY
      readStartY = middleY
    }

    // this.isShowFrame = false
    var object = new Object({
      scale: this.scale,
      x1: readStartX,
      y1: readStartY,
      x2: readEndX,
      y2: readEndY
    })
    var newFrame = new Frame()
    newFrame.position = JSON.stringify(object)
    this.operatBook.pages[this.currentPageIndex].frames.push(newFrame)

    this.currentStartX = 0
    this.currentStartY = 0
    this.currentEndX = 0
    this.currentEndY = 0
    this.drawCanvasFrame()
  }

  getPositionDetail(positionData) {
    if (!positionData || positionData == "") {
      return "未解析到截框坐标信息"
    }

    var positionObject = JSON.parse(positionData)
    return "(" + positionObject.x1 + "," + positionObject.y1 + ")和(" + positionObject.x2 + "," + positionObject.y2 + ")"
  }
}
