import { NextResponse } from "next/server";
import { supabase } from "@lead-sat/shared/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      company: r.company,
      email: r.email,
      phone: r.phone,
      inquiryType: r.inquiry_type,
      message: r.message,
      createdAt: r.created_at,
    }));

    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
