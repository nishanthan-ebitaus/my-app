import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthLayoutComponent } from "./layout/auth-layout.component";
import { SigninComponent } from "./Components/signin/signin.component";
import { SignupComponent } from "./Components/signup/signup.component";

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      // { path: '', redirectTo: 'signin', pathMatch: 'full' },
      { path: 'signin', component: SigninComponent },
      { path: 'signup', component: SignupComponent },
      // { path: '**', redirectTo: 'signin', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
