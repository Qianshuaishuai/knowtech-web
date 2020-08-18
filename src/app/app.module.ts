//Module
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

//Component
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PromptMessageComponent } from './prompt-message/prompt-message.component'; 

//Service 
import { MessageService } from './service/message.service'
import { StorageService } from './service/storage.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PromptMessageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [MessageService,StorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
