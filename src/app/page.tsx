"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";
type ErrorMsg = string | null;

const INQUIRY_TYPES = [
  "서비스 도입 문의",
  "가격 및 요금제",
  "기술 지원",
  "파트너십 제안",
  "기타",
];

export default function LeadPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [submitError, setSubmitError] = useState<ErrorMsg>(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  function validate() {
    const next: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) next.name = "이름을 입력해주세요.";
    if (!form.email.trim()) {
      next.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "올바른 이메일 형식이 아닙니다.";
    }
    if (!form.phone.trim()) {
      next.phone = "전화번호를 입력해주세요.";
    } else if (!/^[0-9\-+\s()]{7,20}$/.test(form.phone)) {
      next.phone = "올바른 전화번호 형식이 아닙니다.";
    }
    if (!form.inquiryType) next.inquiryType = "문의 유형을 선택해주세요.";
    if (!form.agree) next.agree = "개인정보 수집·이용에 동의해주세요.";
    return next;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    setForm((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setFormState("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "제출 중 오류가 발생했습니다. 다시 시도해주세요.");
        setFormState("error");
        return;
      }
      setFormState("success");
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">접수 완료</h2>
          <p className="text-slate-500 leading-relaxed">
            소중한 정보를 남겨주셔서 감사합니다.<br />
            담당자가 <strong className="text-slate-700">24시간 내</strong>에 연락드리겠습니다.
          </p>
          <button
            onClick={() => {
              setForm({ name: "", company: "", email: "", phone: "", inquiryType: "", message: "", agree: false });
              setErrors({});
              setFormState("idle");
            }}
            className="mt-8 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            다시 작성하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-lg w-full">
        {/* 헤더 */}
        <div className="mb-8">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            Free Consultation
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">무료 상담 신청</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            정보를 입력하시면 전문 담당자가 24시간 내에 연락드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* 이름 + 회사명 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                이름 <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="홍길동"
                value={form.name}
                onChange={handleChange}
                className={inputClass(!!errors.name)}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1.5">
                회사명 <span className="text-slate-400 font-normal text-xs">(선택)</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="(주)회사명"
                value={form.company}
                onChange={handleChange}
                className={inputClass(false)}
              />
            </div>
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              이메일 <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass(!!errors.email)}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
              전화번호 <span className="text-red-400">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="010-0000-0000"
              value={form.phone}
              onChange={handlePhoneChange}
              className={inputClass(!!errors.phone)}
            />
            {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* 문의 유형 */}
          <div>
            <label htmlFor="inquiryType" className="block text-sm font-medium text-slate-700 mb-1.5">
              문의 유형 <span className="text-red-400">*</span>
            </label>
            <select
              id="inquiryType"
              name="inquiryType"
              value={form.inquiryType}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer
                ${errors.inquiryType
                  ? "border-red-300 bg-red-50 text-slate-800 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                  : "border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                }
                ${!form.inquiryType ? "text-slate-400" : "text-slate-800"}`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="" disabled>문의 유형 선택</option>
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.inquiryType && <p className="mt-1.5 text-xs text-red-500">{errors.inquiryType}</p>}
          </div>

          {/* 문의 내용 */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
              문의 내용 <span className="text-slate-400 font-normal text-xs">(선택)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="궁금하신 내용을 자유롭게 적어주세요."
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 text-sm outline-none transition-all resize-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          {/* 개인정보 동의 */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${errors.agree
                    ? "border-red-400 bg-red-50"
                    : form.agree
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-300 bg-white group-hover:border-blue-400"
                  }`}>
                  {form.agree && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-600 leading-relaxed">
                <span className="font-medium text-slate-700">개인정보 수집·이용에 동의합니다.</span>{" "}
                <span className="text-slate-400 text-xs">(필수)</span>
                <br />
                <span className="text-xs text-slate-400">
                  수집 항목: 이름, 이메일, 전화번호 / 목적: 상담 및 서비스 안내 / 보유기간: 1년
                </span>
              </span>
            </label>
            {errors.agree && <p className="mt-1.5 text-xs text-red-500">{errors.agree}</p>}
          </div>

          {/* 에러 메시지 */}
          {formState === "error" && submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {submitError}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={formState === "submitting"}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {formState === "submitting" ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                제출 중...
              </>
            ) : (
              "상담 신청하기 →"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          입력하신 정보는 상담 목적으로만 사용되며 제3자에게 제공되지 않습니다.
        </p>
      </div>
    </main>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-300 text-sm outline-none transition-all",
    hasError
      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400"
      : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400",
  ].join(" ");
}
