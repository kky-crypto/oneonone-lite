"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Member {
  id: string;
  name: string;
  email: string;
  title: string | null;
  department: string | null;
  note: string | null;
  created_at: string;
  meeting_count: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberMeetings, setMemberMeetings] = useState<Array<{ id: string; created_at: string; summary: Record<string, unknown> | null }>>([]);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    if (data) {
      // 각 멤버의 미팅 수 조회
      const membersWithCount = await Promise.all(
        data.map(async (m) => {
          const { count } = await supabase
            .from("meetings")
            .select("*", { count: "exact", head: true })
            .eq("member_name", m.name);
          return { ...m, meeting_count: count || 0 };
        })
      );
      setMembers(membersWithCount);
    }
    setLoading(false);
  }

  async function selectMember(member: Member) {
    setSelectedMember(member);
    const { data } = await supabase
      .from("meetings")
      .select("id, created_at, summary")
      .eq("member_name", member.name)
      .order("created_at", { ascending: false });
    setMemberMeetings(data || []);
  }

  async function deleteMember(id: string) {
    if (!confirm("이 구성원을 목록에서 제외할까요?")) return;
    await supabase.from("members").delete().eq("id", id);
    setSelectedMember(null);
    loadMembers();
  }

  if (loading) return <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">👥 구성원 관리</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-mint-400 hover:bg-mint-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 구성원 추가
        </button>
      </div>

      {/* 구성원 목록 */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">아직 등록된 구성원이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">1on1을 시작하려면 먼저 구성원을 추가해 주세요.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 px-4 py-2 bg-mint-400 hover:bg-mint-500 text-white text-sm rounded-lg"
          >
            + 구성원 추가
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => selectMember(member)}
              className={`text-left p-4 bg-white rounded-xl border transition-all ${
                selectedMember?.id === member.id ? "border-mint-400 shadow-md" : "border-gray-200 hover:border-mint-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center text-sm font-bold text-mint-700">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    {member.title && <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{member.title}</span>}
                  </div>
                  <p className="text-xs text-gray-500">{member.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">1on1 {member.meeting_count}회</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 구성원 상세 */}
      {selectedMember && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-mint-100 flex items-center justify-center text-lg font-bold text-mint-700">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                <p className="text-sm text-gray-500">{selectedMember.email}</p>
                {selectedMember.department && <p className="text-xs text-gray-400">{selectedMember.department}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditTarget(selectedMember)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">수정</button>
              <button onClick={() => deleteMember(selectedMember.id)} className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">제외</button>
            </div>
          </div>

          {selectedMember.note && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-1">메모</p>
              <p className="text-sm text-gray-700">{selectedMember.note}</p>
            </div>
          )}

          {/* 미팅 기록 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">미팅 기록</h4>
            {memberMeetings.length === 0 ? (
              <p className="text-sm text-gray-400">아직 미팅 기록이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {memberMeetings.map((m) => (
                  <div key={m.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(m.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    {m.summary && (m.summary as { discussion_topics?: string[] }).discussion_topics && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {((m.summary as { discussion_topics?: string[] }).discussion_topics || []).slice(0, 2).join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 추가 모달 */}
      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); loadMembers(); }} />}

      {/* 수정 모달 */}
      {editTarget && <EditMemberModal member={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); loadMembers(); if (selectedMember?.id === editTarget.id) selectMember({ ...editTarget }); }} />}
    </div>
  );
}

function AddMemberModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("이름을 입력해 주세요."); return; }
    if (!email.trim() || !email.includes("@")) { setError("올바른 이메일을 입력해 주세요."); return; }
    setSaving(true);
    const { error: dbError } = await supabase.from("members").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      title: title.trim() || null,
      department: department.trim() || null,
      note: note.trim() || null,
    });
    if (dbError) {
      setError(dbError.code === "23505" ? "이미 등록된 이메일입니다." : "저장 중 오류가 발생했습니다.");
      setSaving(false);
    } else {
      onSuccess();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">구성원 추가</h3>
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
        <div>
          <label className="text-sm font-medium">이름 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="구성원 이름" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div>
          <label className="text-sm font-medium">이메일 *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div>
          <label className="text-sm font-medium">직무/역할</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 백엔드 개발" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div>
          <label className="text-sm font-medium">부서</label>
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="예: 서비스개발팀" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div>
          <label className="text-sm font-medium">메모</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="참고할 내용" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">취소</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-mint-400 hover:bg-mint-500 text-white rounded-lg disabled:bg-gray-300">
            {saving ? "저장 중..." : "추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditMemberModal({ member, onClose, onSuccess }: { member: Member; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(member.name);
  const [title, setTitle] = useState(member.title || "");
  const [department, setDepartment] = useState(member.department || "");
  const [note, setNote] = useState(member.note || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("members").update({
      name: name.trim(),
      title: title.trim() || null,
      department: department.trim() || null,
      note: note.trim() || null,
    }).eq("id", member.id);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">구성원 정보 수정</h3>
        <div>
          <label className="text-sm font-medium">이메일</label>
          <input type="text" value={member.email} disabled className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" />
        </div>
        <div>
          <label className="text-sm font-medium">이름 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div>
          <label className="text-sm font-medium">직무/역할</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div>
          <label className="text-sm font-medium">부서</label>
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div>
          <label className="text-sm font-medium">메모</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-mint-400" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">취소</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-mint-400 hover:bg-mint-500 text-white rounded-lg disabled:bg-gray-300">
            {saving ? "저장 중..." : "수정하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
