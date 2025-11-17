/**
 * Authentication Error Messages
 * Maps API error codes to user-friendly Arabic messages
 */

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Login errors
  INVALID_CREDENTIALS: 'رقم الهاتف أو كلمة المرور غير صحيحة',
  USER_NOT_FOUND: 'لا يوجد مستخدم بهذا الرقم',
  ACCOUNT_DISABLED: 'تم تعطيل حسابك. يرجى التواصل مع الدعم',

  // Registration errors
  PHONE_ALREADY_EXISTS: 'رقم الهاتف مسجل مسبقاً',
  INVALID_PHONE_FORMAT: 'تنسيق رقم الهاتف غير صحيح',
  WEAK_PASSWORD: 'كلمة المرور ضعيفة. يجب أن تحتوي على 8 أحرف على الأقل',
  INVALID_INVITATION_CODE: 'رمز الدعوة غير صحيح',

  // OTP errors
  INVALID_OTP: 'الرمز غير صحيح. يرجى المحاولة مرة أخرى',
  OTP_EXPIRED: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد',
  OTP_MAX_ATTEMPTS: 'تجاوزت الحد الأقصى من المحاولات. يرجى المحاولة بعد قليل',
  OTP_SEND_LIMIT: 'لقد أرسلنا عدة رموز. يرجى الانتظار قبل طلب رمز جديد',

  // Token errors
  TOKEN_EXPIRED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
  INVALID_TOKEN: 'الرمز غير صحيح. يرجى تسجيل الدخول مرة أخرى',
  TOKEN_REQUIRED: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة',

  // Password reset errors
  RESET_TOKEN_INVALID: 'رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية',
  RESET_TOKEN_EXPIRED: 'انتهت صلاحية رابط إعادة تعيين كلمة المرور',

  // Social login errors
  SOCIAL_AUTH_FAILED: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى',
  INVALID_SOCIAL_TOKEN: 'رمز المصادقة غير صحيح',

  // General errors
  NETWORK_ERROR: 'خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت',
  SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
  VALIDATION_ERROR: 'يرجى التحقق من البيانات المدخلة',
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
};

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  PASSWORD_TOO_SHORT: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل',
  PASSWORD_MISMATCH: 'كلمة المرور غير متطابقة',
  INVALID_OTP_LENGTH: 'الرمز يجب أن يحتوي على 6 أرقام',
};

/**
 * Maps API error code to user-friendly Arabic message
 */
export function getAuthErrorMessage(errorCode?: string, defaultMessage?: string): string {
  if (!errorCode) {
    return defaultMessage || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  return AUTH_ERROR_MESSAGES[errorCode] || defaultMessage || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Validates phone number format (Egyptian format)
 */
export function validatePhone(phone: string): boolean {
  // Egyptian phone format:
  // - Local: 01XXXXXXXXX (11 digits starting with 01)
  // - International: +2001XXXXXXXXX or 002001XXXXXXXXX
  const phoneRegex = /^(01\d{9}|(\+20|0020)1\d{9})$/;
  return phoneRegex.test(phone);
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT,
    };
  }

  return { isValid: true };
}

/**
 * Validates OTP code
 */
export function validateOTP(code: string): boolean {
  return /^\d{6}$/.test(code);
}
