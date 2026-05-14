import { describe, it, expect } from "vitest";
import { formatPhone, validateLeadForm, type LeadFormValues } from "./validation";

function makeForm(overrides: Partial<LeadFormValues> = {}): LeadFormValues {
  return {
    name: "홍길동",
    company: "(주)테스트",
    email: "test@example.com",
    phone: "010-1234-5678",
    inquiryType: "서비스 도입 문의",
    message: "문의 내용",
    agree: true,
    ...overrides,
  };
}

describe("formatPhone", () => {
  it("11자리 휴대폰 번호를 010-1234-5678 형태로 포맷팅한다", () => {
    expect(formatPhone("01012345678")).toBe("010-1234-5678");
  });

  it("4~7자리 입력은 첫 번째 하이픈만 삽입한다", () => {
    expect(formatPhone("0101234")).toBe("010-1234");
    expect(formatPhone("01012")).toBe("010-12");
  });

  it("3자리 이하 입력은 하이픈 없이 그대로 반환한다", () => {
    expect(formatPhone("010")).toBe("010");
    expect(formatPhone("01")).toBe("01");
    expect(formatPhone("")).toBe("");
  });

  it("이미 하이픈이 포함된 입력에서도 숫자만 다시 포맷팅한다", () => {
    expect(formatPhone("010-1234-5678")).toBe("010-1234-5678");
    expect(formatPhone("010-12")).toBe("010-12");
  });

  it("숫자가 아닌 문자는 모두 제거한다", () => {
    expect(formatPhone("abc010def1234ghi5678")).toBe("010-1234-5678");
    expect(formatPhone("(010) 1234 5678")).toBe("010-1234-5678");
  });

  it("11자리를 초과하는 입력은 잘라낸다", () => {
    expect(formatPhone("010123456789999")).toBe("010-1234-5678");
  });
});

describe("validateLeadForm", () => {
  it("모든 필수 항목이 유효하면 에러가 없다", () => {
    expect(validateLeadForm(makeForm())).toEqual({});
  });

  describe("name", () => {
    it("빈 문자열이면 에러", () => {
      expect(validateLeadForm(makeForm({ name: "" })).name).toBeDefined();
    });

    it("공백만 있어도 에러", () => {
      expect(validateLeadForm(makeForm({ name: "   " })).name).toBeDefined();
    });
  });

  describe("email", () => {
    it("빈 값이면 '입력해주세요' 에러", () => {
      const errors = validateLeadForm(makeForm({ email: "" }));
      expect(errors.email).toBe("이메일을 입력해주세요.");
    });

    it("@가 없으면 형식 에러", () => {
      const errors = validateLeadForm(makeForm({ email: "noatsign.com" }));
      expect(errors.email).toBe("올바른 이메일 형식이 아닙니다.");
    });

    it("도메인 점(.)이 없으면 형식 에러", () => {
      const errors = validateLeadForm(makeForm({ email: "user@host" }));
      expect(errors.email).toBe("올바른 이메일 형식이 아닙니다.");
    });

    it("공백이 포함되면 형식 에러", () => {
      const errors = validateLeadForm(makeForm({ email: "user @example.com" }));
      expect(errors.email).toBe("올바른 이메일 형식이 아닙니다.");
    });

    it("일반적인 이메일 주소는 통과한다", () => {
      expect(validateLeadForm(makeForm({ email: "a@b.co" })).email).toBeUndefined();
      expect(validateLeadForm(makeForm({ email: "user.name+tag@sub.example.com" })).email).toBeUndefined();
    });
  });

  describe("phone", () => {
    it("빈 값이면 '입력해주세요' 에러", () => {
      const errors = validateLeadForm(makeForm({ phone: "" }));
      expect(errors.phone).toBe("전화번호를 입력해주세요.");
    });

    it("7자 미만이면 형식 에러", () => {
      const errors = validateLeadForm(makeForm({ phone: "123456" }));
      expect(errors.phone).toBe("올바른 전화번호 형식이 아닙니다.");
    });

    it("20자 초과면 형식 에러", () => {
      const errors = validateLeadForm(makeForm({ phone: "1".repeat(21) }));
      expect(errors.phone).toBe("올바른 전화번호 형식이 아닙니다.");
    });

    it("알파벳이 포함되면 형식 에러", () => {
      const errors = validateLeadForm(makeForm({ phone: "010-abcd-5678" }));
      expect(errors.phone).toBe("올바른 전화번호 형식이 아닙니다.");
    });

    it("하이픈 포함된 한국 휴대폰 번호 통과", () => {
      expect(validateLeadForm(makeForm({ phone: "010-1234-5678" })).phone).toBeUndefined();
    });

    it("국제 표기 (+, 공백, 괄호) 통과", () => {
      expect(validateLeadForm(makeForm({ phone: "+82 (10) 1234-5678" })).phone).toBeUndefined();
    });
  });

  describe("inquiryType", () => {
    it("빈 값이면 에러", () => {
      expect(validateLeadForm(makeForm({ inquiryType: "" })).inquiryType).toBeDefined();
    });
  });

  describe("agree", () => {
    it("동의 안 했으면 에러", () => {
      expect(validateLeadForm(makeForm({ agree: false })).agree).toBeDefined();
    });
  });

  it("여러 필드가 동시에 잘못되면 모든 에러를 반환한다", () => {
    const errors = validateLeadForm(makeForm({
      name: "",
      email: "bad",
      phone: "",
      inquiryType: "",
      agree: false,
    }));
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.inquiryType).toBeDefined();
    expect(errors.agree).toBeDefined();
  });

  it("company와 message는 선택 필드이므로 비어 있어도 통과", () => {
    const errors = validateLeadForm(makeForm({ company: "", message: "" }));
    expect(errors).toEqual({});
  });
});
