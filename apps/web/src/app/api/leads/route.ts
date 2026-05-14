import { NextResponse } from "next/server";
import { supabase } from "@lead-sat/shared/supabase";

export async function POST(req: Request) {
  try {
    const { name, company, email, phone, inquiryType, message } = await req.json();

    if (!name || !email || !phone || !inquiryType) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const { error } = await supabase.from("leads").insert({
      name,
      company: company || null,
      email,
      phone,
      inquiry_type: inquiryType,
      message: message || null,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
