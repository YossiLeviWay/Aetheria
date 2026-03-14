"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Bell, Globe, Palette } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAppStore } from "@/stores/app-store";
import Avatar from "@/components/ui/avatar";

type Tab = "profile" | "notifications" | "language" | "appearance";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const tabs = [
    { id: "profile" as Tab, label: t("settings.profile"), icon: User },
    { id: "notifications" as Tab, label: t("settings.notifications"), icon: Bell },
    { id: "language" as Tab, label: t("settings.language"), icon: Globe },
    { id: "appearance" as Tab, label: t("settings.appearance"), icon: Palette },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "language" && <LanguageTab />}
          {activeTab === "appearance" && <AppearanceTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") return;
    setIsDeleting(true);
    try {
      await fetch("/api/account", { method: "DELETE" });
      await signOut({ callbackUrl: "/login" });
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <div className="card">
      <h2 className="font-semibold mb-5">Profile</h2>
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={session?.user?.name ?? "U"} image={session?.user?.image} size="lg" />
        <div>
          <p className="font-medium">{session?.user?.name}</p>
          <p className="text-sm text-text-secondary">{session?.user?.email}</p>
          <button className="text-xs text-primary mt-1 hover:underline">Change photo</button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={session?.user?.email ?? ""}
            readOnly
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-text-secondary cursor-not-allowed"
          />
        </div>
        <button type="submit" className="btn-primary">
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h3>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-sm text-red-700">
              This action is permanent and cannot be undone. All your data will be deleted.
            </p>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1.5">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 text-sm border border-red-300 rounded-xl focus:outline-none focus:border-red-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
                className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "DELETE" || isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none ${
        enabled ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function NotificationsTab() {
  const taskNotifSettings = [
    {
      key: "assigned",
      label: "Task assigned to me",
      description: "Get notified when a task is assigned to you",
    },
    {
      key: "due_soon",
      label: "Due date approaching (1 day)",
      description: "Get notified when a task you own is due within 24 hours",
    },
    {
      key: "overdue",
      label: "Task overdue",
      description: "Get notified when one of your tasks passes its due date",
    },
  ];

  const activityNotifSettings = [
    {
      key: "comment",
      label: "New comment on my items",
      description: "Get notified when someone comments on your tasks or projects",
    },
    {
      key: "mention",
      label: "I'm mentioned in a comment",
      description: "Get notified when someone mentions you in a comment",
    },
    {
      key: "submission",
      label: "Work submission received",
      description: "Get notified when a team member submits work for review",
    },
  ];

  const allKeys = [...taskNotifSettings, ...activityNotifSettings].map((n) => n.key);
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(allKeys.map((k) => [k, true]))
  );

  function toggle(key: string) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="card">
      <h2 className="font-semibold mb-5">Notification Preferences</h2>

      {/* Task Notifications */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Task Notifications
        </p>
        <div className="space-y-4">
          {taskNotifSettings.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{description}</p>
              </div>
              <Toggle enabled={settings[key]} onToggle={() => toggle(key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Activity Notifications */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Activity Notifications
        </p>
        <div className="space-y-4">
          {activityNotifSettings.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{description}</p>
              </div>
              <Toggle enabled={settings[key]} onToggle={() => toggle(key)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LanguageTab() {
  const { language, setLanguage } = useAppStore();

  return (
    <div className="card">
      <h2 className="font-semibold mb-5">Language & Region</h2>
      <div className="space-y-3">
        {[
          { code: "en", label: "English", sublabel: "Left to Right" },
          { code: "he", label: "עברית (Hebrew)", sublabel: "Right to Left" },
        ].map(({ code, label, sublabel }) => (
          <button
            key={code}
            onClick={() => setLanguage(code as "en" | "he")}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
              language === code ? "border-primary bg-primary/5" : "border-border hover:border-gray-300"
            }`}
          >
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-text-secondary">{sublabel}</p>
            </div>
            {language === code && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function AppearanceTab() {
  return (
    <div className="card">
      <h2 className="font-semibold mb-5">Appearance</h2>
      <div>
        <p className="text-sm font-medium mb-3">Theme</p>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 rounded-xl border-2 border-primary bg-primary/5 text-left">
            <div className="w-full h-16 bg-white rounded-lg border border-gray-200 mb-2 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-100 rounded" />
            </div>
            <p className="text-sm font-medium">Light</p>
            <p className="text-xs text-text-secondary">Default theme</p>
          </button>
          <button
            className="p-4 rounded-xl border-2 border-border text-left opacity-60 cursor-not-allowed"
            title="Coming soon"
          >
            <div className="w-full h-16 bg-gray-800 rounded-lg border border-gray-700 mb-2 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-700 rounded" />
            </div>
            <p className="text-sm font-medium">Dark</p>
            <p className="text-xs text-text-secondary">Coming soon</p>
          </button>
        </div>
      </div>
    </div>
  );
}
