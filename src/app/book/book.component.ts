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
  OK_RESPONSE_NUMBER,
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

  //模块参数
  modelIndex = 1
  pageIndex = 1
  pageSize = 20
  totalCount = 0

  //书本数据
  operatBook = new Book
  grades = Grades
  searchStr = ""

  //网络相关
  userInfo = new UserInfo()
  bookList = new Array()
  cos
  bookSubscription: Subscription

  constructor(private message: ElMessageService,
    private bookService: BookService,
    private messageService: MessageService, ) {

  }

  ngOnInit() {
    this.initCOSUploadConfig()
    this.getUserInfo()
    this.getBookList()
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
    const bookId = scope.rowData.id
    this.getBookDetail(bookId)
  }

  //删除
  delete(scope) {
    const bookId = scope.rowData.id
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
        this.modelIndex = 2
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
    this.modelIndex = 2
    this.operatBook = new Book()
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
  uploadResource(event, pageIndex, frameIndex) {
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

        that.operatBook.pages[pageIndex].frames[frameIndex].resourceUrl = resourceUrl
        console.log(that.operatBook)
      });
    }
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
    this.operatBook.pages[index].frames.push(new Frame())
  }

  //删除书页
  deletePage(index) {
    this.operatBook.pages.splice(index, 1)
  }

  //删除截图框
  deleteFrame(pageIndex,frameIndex){
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

    if (!this.operatBook.pubDate) {
      this.message['warning']("请先选择出版日期")
      return false
    }

    if (!this.operatBook.cover) {
      this.message['warning']("请先上传书本封面")
      return false
    }

    this.operatBook.pages.forEach(page => {
      if (!page.cover) {
        this.message['warning']("有书页的图片还未上传")
        return false
      }

      page.frames.forEach(frame => {
        if (!frame.resourceUrl) {
          this.message['warning']("有截图框的资源还未选择")
          return false
        }
      });
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
    
    const bookId = this.operatBook.id
    //当bookId存在时为编辑，不存在为新建
    if (bookId && bookId != 0) {
      this.editBook(userId,bookId)
    } else {
      this.addBook(userId)
    }

    return
  }

  addBook(userId) {
    this.bookSubscription = this.bookService.addBook(String(userId), JSON.stringify(this.operatBook)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("新建成功")
        this.modelIndex = 1
        this.operatBook = new Book()
        this.getBookList()
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }

  editBook(userId,bookId){
    this.bookSubscription = this.bookService.editBook(String(userId),String(bookId), JSON.stringify(this.operatBook)).subscribe(response => {
      if (response.F_responseNo == OK_RESPONSE_NUMBER) {
        this.message['success']("更改成功")
        this.modelIndex = 1
        this.operatBook = new Book()
        this.getBookList()
      } else {
        this.message['error'](response.F_responseMsg)
      }
    });
  }

}
