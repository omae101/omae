export type LeadFormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  agree: boolean;
};

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9\-+\s()]{7,20}$/;

export function validateLeadForm(form: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {};

  if (!form.name.trim()) errors.name = "이름을 입력해주세요.";

  if (!form.email.trim()) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!form.phone.trim()) {
    errors.phone = "전화번호를 입력해주세요.";
  } else if (!PHONE_REGEX.test(form.phone)) {
    errors.phone = "올바른 전화번호 형식이 아닙니다.";
  }

  if (!form.inquiryType) errors.inquiryType = "문의 유형을 선택해주세요.";
  if (!form.agree) errors.agree = "개인정보 수집·이용에 동의해주세요.";

  return errors;
}

export function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length > 3) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return digits;
}
