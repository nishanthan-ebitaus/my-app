export const API_URL = {
  AUTH: {
    VALIDATE_EMAIL: '/auth/sendSignUpValidationEmail',
    VALIDATE_EMAIL_OTP: '/auth/validateSignUpEmail',
    SIGNIN: '/auth/signIn',
    SIGNUP: '/auth/taxus/createTaxusUserAndEntity',
    VERIFY_OTP: '/auth/login',
    RESEND_OTP: '/auth/resend-otp',
    ENTITY_MAP: '/auth/taxus/getEntityMap',
  },
  GST: {
    GST_DETAILS_MCA: '/auth/taxus/fetchCompanyDetailsFromMCA',
    REQUEST_GST_OTP: '/auth/taxus/requestGstOtp',
    VERIFY_GST_OTP: '/auth/taxus/obtainGstToken',
  },
  APPROVAL: {
    VERFICAITON: '/taxus/approvals/verification',
    ACTION: '/taxus/approvals/action',
  },
  USER: {
    USER_INFO: '/taxus/user/getRoleAndAccessInfo',
    ENTITY_MAP: '/auth/taxus/getEntityMap',
    CACHE_SUB_ENTITY: '/taxus/user/cacheRoleAccessForSubEntity',
    RESEND_APPROVAL_REQUEST: '/taxus/user/sendApprovalRequest',
    IRP_CREDENTIALS: '/taxus/user/SaveIRPCredentials',
  }
};
