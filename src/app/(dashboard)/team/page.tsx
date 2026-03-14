"use client";

import { useState, useEffect } from "react";
import { Plus, UserX, Shield, User, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useSession } from "next-auth/react";
import Avatar from "@/components/ui/avatar";
import Modal from "@/components/ui/modal";
import Badge from "@/components/ui/badge";
import type { WorkspaceMember } from "@/types";

const roleIcons = { admin: Shield, member: User, viewer: Eye };

export default function TeamPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const currentUserId = (session?.user as { id?: string })?.id;
  const currentMember = members.find((m) => m.userId === currentUserId);
  const isAdmin = currentMember?.role === "admin";

  useEffect(() => {
    fetch("/api/workspace/members")
      .then((r) => r.json())
      .then((data) => { setMembers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member?")) return;
    const res = await fetch(`/api/workspace/members/${memberId}`, { method: "DELETE" });
    if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("team.members")}</h1>
          <p className="text-text-secondary mt-1 text-sm">{members.length} members</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            {t("team.invite")}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card flex items-center gap-4 animate-pulse">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
          ))
        ) : (
          members.map((member) => {
            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] ?? User;
            const isCurrentUser = member.userId === currentUserId;
            return (
              <div key={member.id} className="card flex items-center gap-4">
                <Avatar name={member.user.name} avatarUrl={member.user.avatarUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{member.user.name}</p>
                    {isCurrentUser && (
                      <span className="text-xs text-text-secondary">(You)</span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                    <RoleIcon size={13} />
                    <span className="capitalize">{member.role}</span>
                  </div>
                  {isAdmin && !isCurrentUser && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger/10 hover:text-danger text-text-secondary transition-colors"
                      aria-label="Remove member"
                    >
                      <UserX size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invite modal */}
      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInvited={(m) => { setMembers((prev) => [...prev, m]); setShowInvite(false); }}
      />
    </div>
  );
}

function InviteModal({ open, onClose, onInvited }: {
  open: boolean; onClose: () => void; onInvited: (m: WorkspaceMember) => void;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/workspace/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    if (res.ok) {
      onInvited(await res.json());
      setEmail(""); setRole("member");
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to invite");
    }
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title={t("team.invite")}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("team.inviteEmail")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary"
            placeholder="name@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{t("team.role")}</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary bg-white"
          >
            <option value="admin">{t("team.admin")}</option>
            <option value="member">{t("team.member")}</option>
            <option value="viewer">{t("team.viewer")}</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">{t("common.cancel")}</button>
          <button type="submit" disabled={loading || !email} className="btn-primary disabled:opacity-50">
            {loading ? t("common.loading") : t("team.invite")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
