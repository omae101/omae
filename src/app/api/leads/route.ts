import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { desc, or, ilike } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    const rows = await db
      .select()
      .from(leads)
      .where(
        q
          ? or(
              ilike(leads.name, `%${q}%`),
              ilike(leads.email, `%${q}%`),
              ilike(leads.company, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(leads.createdAt));

    return NextResponse.json(rows);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, company, email, phone, inquiryType, message } = await req.json();

    if (!name || !email || !phone || !inquiryType) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    await db.insert(leads).values({ name, company, email, phone, inquiryType, message });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
