//Module
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

//Component
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PromptMessageComponent } from './prompt-message/prompt-message.component';
import { QuestionComponent } from './question/question.component'

//Service 
import { BookService } from './service/book.service'
import { MessageService } from './service/message.service'
import { StorageService } from './service/storage.service';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from './service/user.service'
import { QuestionService } from './service/question.service'
import { HttpClientService } from './service/http-client.service'
import { LoaderService } from './service/loader.service'

// import module
import { ElModule } from 'element-angular'

// if you use webpack, import style
import 'element-angular/theme/index.css';
import { UserComponent } from './user/user.component';
import { BookComponent } from './book/book.component';
import { RegisterComponent } from './register/register.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PromptMessageComponent,
    UserComponent,
    BookComponent,
    QuestionComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ElModule.forRoot(),
  ],
  providers: [UserService, HttpClientService, LoaderService, MessageService, StorageService,BookService,QuestionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
