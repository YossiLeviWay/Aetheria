"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Bell, Globe, Clock, Palette } from "lucide-react";
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // In a full implementation, this would call the API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card">
      <h2 className="font-semibold mb-5">Profile</h2>
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={session?.user?.name ?? "U"} avatarUrl={session?.user?.image} size="lg" />
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
    </div>
  );
}

function NotificationsTab() {
  const notifSettings = [
    { key: "assigned", label: "Task assigned to me" },
    { key: "comment", label: "New comment on my items" },
    { key: "mention", label: "I'm mentioned in a comment" },
    { key: "due_soon", label: "Due date approaching (1 day)" },
    { key: "overdue", label: "Task overdue" },
    { key: "submission", label: "Work submission received" },
  ];

  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(notifSettings.map((n) => [n.key, true]))
  );

  return (
    <div className="card">
      <h2 className="font-semibold mb-5">Notification Preferences</h2>
      <div className="space-y-4">
        {notifSettings.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm">{label}</span>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                settings[key] ? "bg-primary" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={settings[key]}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings[key] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
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
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
          <button className="p-4 rounded-xl border-2 border-border text-left opacity-60 cursor-not-allowed" title="Coming soon">
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
