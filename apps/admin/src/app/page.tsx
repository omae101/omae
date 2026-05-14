"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  inquiryType: string;
  message: string | null;
  createdAt: string;
};

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

const MODAL_INPUT_CLASS =
  "w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all";

const INQUIRY_TYPES = [
  "서비스 도입 문의",
  "가격 및 요금제",
  "기술 지원",
  "파트너십 제안",
  "기타",
];

const INQUIRY_COLOR: Record<string, string> = {
  "서비스 도입 문의": "bg-blue-50 text-blue-600",
  "가격 및 요금제": "bg-violet-50 text-violet-600",
  "기술 지원": "bg-amber-50 text-amber-600",
  "파트너십 제안": "bg-emerald-50 text-emerald-600",
  "기타": "bg-slate-100 text-slate-500",
};

function IconRefresh() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [detailTarget, setDetailTarget] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const fetchLeads = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(query);
  }, [query, fetchLeads]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(search);
  }

  async function handleSave() {
    if (!editTarget) return;
    setSaving(true);
    await fetch(`/api/leads/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editTarget),
    });
    setSaving(false);
    setEditTarget(null);
    fetchLeads(query);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/leads/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    fetchLeads(query);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">리드 관리</h1>
            <p className="text-sm text-slate-500 mt-1">
              총 <span className="font-semibold text-slate-700">{leads.length}</span>건
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLeads(query)}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1.5"
            >
              <IconRefresh />
              새로고침
            </button>
            <a href={WEB_URL} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              ← 상담 신청 폼
            </a>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-red-500 font-medium transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="이름, 이메일, 회사명으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
          <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
            검색
          </button>
          {query && (
            <button
              type="button"
              onClick={() => { setSearch(""); setQuery(""); }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-xl transition-colors"
            >
              초기화
            </button>
          )}
        </form>

        {/* 테이블 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400 text-sm">불러오는 중...</div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-slate-400 text-sm">데이터가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">이름</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">회사명</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">연락처</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">이메일</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">문의 유형</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">문의 내용</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">등록일</th>
                    <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                      onClick={() => setDetailTarget(lead)}
                    >
                      <td className="px-4 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{lead.name}</td>
                      <td className="px-4 py-3.5 text-slate-500">{lead.company || <span className="text-slate-300">-</span>}</td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">{lead.phone}</td>
                      <td className="px-4 py-3.5 text-slate-600">{lead.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${INQUIRY_COLOR[lead.inquiryType] ?? "bg-slate-100 text-slate-500"}`}>
                          {lead.inquiryType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 max-w-[180px] truncate">
                        {lead.message || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditTarget({ ...lead })}
                            title="수정"
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(lead)}
                            title="삭제"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      {detailTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetailTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">상세 정보</h2>
              <button onClick={() => setDetailTarget(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <IconClose />
              </button>
            </div>
            <div className="space-y-3">
              <DetailRow label="이름" value={detailTarget.name} />
              <DetailRow label="회사명" value={detailTarget.company || "-"} />
              <DetailRow label="연락처" value={detailTarget.phone} />
              <DetailRow label="이메일" value={detailTarget.email} />
              <DetailRow label="문의 유형" value={detailTarget.inquiryType} />
              <DetailRow label="등록일" value={new Date(detailTarget.createdAt).toLocaleDateString("ko-KR")} />
              {detailTarget.message && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">문의 내용</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2.5 leading-relaxed">{detailTarget.message}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => { setDetailTarget(null); setEditTarget({ ...detailTarget }); }}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              수정하기
            </button>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">리드 수정</h2>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <IconClose />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">이름 *</label>
                  <input type="text" value={editTarget.name} onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })} className={MODAL_INPUT_CLASS} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">회사명</label>
                  <input type="text" value={editTarget.company ?? ""} onChange={(e) => setEditTarget({ ...editTarget, company: e.target.value })} className={MODAL_INPUT_CLASS} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">이메일 *</label>
                <input type="email" value={editTarget.email} onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })} className={MODAL_INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">전화번호 *</label>
                <input type="tel" value={editTarget.phone} onChange={(e) => setEditTarget({ ...editTarget, phone: e.target.value })} className={MODAL_INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">문의 유형 *</label>
                <select
                  value={editTarget.inquiryType}
                  onChange={(e) => setEditTarget({ ...editTarget, inquiryType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none"
                >
                  {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">문의 내용</label>
                <textarea rows={3} value={editTarget.message ?? ""} onChange={(e) => setEditTarget({ ...editTarget, message: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                {saving ? "저장 중..." : "저장"}
              </button>
              <button onClick={() => setEditTarget(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">리드 삭제</h2>
              <button onClick={() => setDeleteTarget(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <IconClose />
              </button>
            </div>
            <div className="mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <IconTrash />
              </div>
              <p className="text-slate-700 text-sm font-semibold">정말 삭제하시겠습니까?</p>
              <p className="text-slate-500 text-sm mt-1">
                <span className="font-medium">{deleteTarget.name}</span>({deleteTarget.email})
              </p>
              <p className="text-slate-400 text-xs mt-2">삭제된 데이터는 복구할 수 없습니다.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-slate-400 w-20 shrink-0">{label}</span>
      <span className="text-sm text-slate-700">{value}</span>
    </div>
  );
}
