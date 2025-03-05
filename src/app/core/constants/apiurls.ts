export const API_URL = {
  AUTH: {
    SIGNIN: '/auth/signIn',
    SIGNUP: '/auth/taxus/createTaxusUserAndEntity',
    VERIFY_OTP: '/auth/login',
    RESEND_OTP: '/auth/resend-otp',
  },
  GST: {
    GST_DETAILS_MCA: '/auth/taxus/fetchCompanyDetailsFromMCA',
    REQUEST_GST_OTP: '/auth/taxus/requestGstOtp',
    VERIFY_GST_OTP: '/auth/taxus/obtainGstToken',
  },
  APPROVAL: {
    VERFICAITON: '/taxus/approvals/verification',
    ACTION: '/taxus/approvals/action',
  }
};
