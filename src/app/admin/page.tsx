"use client";

import { useEffect, useState, useCallback } from "react";

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

const MODAL_INPUT_CLASS = MODAL_INPUT_CLASS;

const INQUIRY_TYPES = [
  "서비스 도입 문의",
  "가격 및 요금제",
  "기술 지원",
  "파트너십 제안",
  "기타",
];

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

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

  async function handleDelete(id: number) {
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setDeleteId(null);
    fetchLeads(query);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">리드 어드민</h1>
            <p className="text-sm text-slate-500 mt-1">총 {leads.length}건</p>
          </div>
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 폼 페이지
          </a>
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="이름, 이메일, 회사명으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              불러오는 중...
            </div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              데이터가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">이름</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">회사</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">이메일</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">전화번호</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">문의유형</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">등록일</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{lead.name}</td>
                      <td className="px-4 py-3 text-slate-500">{lead.company || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.email}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                          {lead.inquiryType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(lead.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric", month: "2-digit", day: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditTarget({ ...lead })}
                            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg transition-colors font-medium"
                          >
                            수정
                          </button>
                          {deleteId === lead.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDelete(lead.id)}
                                className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                              >
                                확인
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                className="text-xs px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteId(lead.id)}
                              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-600 rounded-lg transition-colors font-medium"
                            >
                              삭제
                            </button>
                          )}
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

      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">리드 수정</h2>
              <button
                onClick={() => setEditTarget(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">이름 *</label>
                  <input
                    type="text"
                    value={editTarget.name}
                    onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                    className={MODAL_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">회사명</label>
                  <input
                    type="text"
                    value={editTarget.company ?? ""}
                    onChange={(e) => setEditTarget({ ...editTarget, company: e.target.value })}
                    className={MODAL_INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">이메일 *</label>
                <input
                  type="email"
                  value={editTarget.email}
                  onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })}
                  className={MODAL_INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">전화번호 *</label>
                <input
                  type="tel"
                  value={editTarget.phone}
                  onChange={(e) => setEditTarget({ ...editTarget, phone: e.target.value })}
                  className={MODAL_INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">문의 유형 *</label>
                <select
                  value={editTarget.inquiryType}
                  onChange={(e) => setEditTarget({ ...editTarget, inquiryType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none"
                >
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">문의 내용</label>
                <textarea
                  rows={3}
                  value={editTarget.message ?? ""}
                  onChange={(e) => setEditTarget({ ...editTarget, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={() => setEditTarget(null)}
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
