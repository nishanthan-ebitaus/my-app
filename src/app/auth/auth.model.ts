export enum SignupStep {
  EMAIL_VERIFICATION = 'email',
  SIGNUP_ACCOUNT_DETAILS = 'account_details',
}

export enum SigninStep {
  EMAIL_VERIFICATION = 'email',
  OTP_VERIFICATION = 'otp',
}

export interface SigninRequest {
  username: string;
}

export interface VerifyOptRequest {
  username: string;
  otp: string;
}

export interface Signup {
  gstIN: string,
  email: string,
  isAgree: boolean,
}

export interface GstDetailsMca {
  emailId: string,
  gstIN: string,
  gstUsername: string,
}

export interface GstOtp {
  gstUsername: string,
}

export interface VerifyGstOtp {
  gstIN: string,
  otp: string,
}

export interface IrpCredentials {
  username: string,
  password: string,
}
