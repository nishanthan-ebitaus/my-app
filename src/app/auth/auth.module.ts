import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { SigninComponent } from './Components/signin/signin.component';
import { SignupComponent } from './Components/signup/signup.component';
import { InputComponent } from "@shared/ui/input/input.component";
import { ButtonComponent } from "@shared/ui/button/button.component";
import { UiOtpComponent } from "@shared/ui/otp/otp.component";
import { AsyncPipe, NgIf } from '@angular/common';
import { TermsInfoComponent } from '../components/terms-info/terms-info.component';
import { ModalComponent } from '../shared/ui/modal/modal.component';
import { SelectComponent } from '../shared/ui/select/select.component';
import { VerifyOtpComponent } from './Components/verify-otp/verify-otp.component';
import { AuthService } from './auth.service';
import { IrpCredentialsComponent } from './Components/irp-credentials/irp-credentials.component';

@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    IrpCredentialsComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    InputComponent,
    ButtonComponent,
    UiOtpComponent,
    NgIf,
    AsyncPipe,
    TermsInfoComponent,
    ModalComponent,
    SelectComponent,
    VerifyOtpComponent,
    ReactiveFormsModule,
  ],
  providers: [AuthService],
})
export class AuthModule { }
