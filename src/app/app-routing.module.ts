import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { BookComponent } from './book/book.component';
import { QuestionComponent } from './question/question.component';

const routes: Routes = [
  {
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	},
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'user',
    component: UserComponent
  },
  {
    path: 'book',
    component: BookComponent
  },
  {
    path: 'question',
    component: QuestionComponent
  },
  {
    path: 'register/:moduleId',
    component:RegisterComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

  
}
