'use client';

// Settings page - accent, difficulty, volume, BGM, accessibility
// M7: UI finishing

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import AppLayout from '@/components/layout/AppLayout';

interface UserSettings {
  accent: string;
  difficulty: string;
  grade: number;
  bgmVolume: number;
  sfxVolume: number;
  globalVolume: number;
  reducedMotion: boolean;
  bgmStyle: string | null;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    accent: 'en-US',
    difficulty: 'medium',
    grade: 7,
    bgmVolume: 0.5,
    sfxVolume: 0.7,
    globalVolume: 0.8,
    reducedMotion: false,
    bgmStyle: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        const user = data.user || data;
        setSettings({
          accent: user.accent || 'en-US',
          difficulty: user.difficulty || 'medium',
          grade: user.grade || 7,
          bgmVolume: user.bgmVolume ?? 0.5,
          sfxVolume: user.sfxVolume ?? 0.7,
          globalVolume: user.globalVolume ?? 0.8,
          reducedMotion: user.reducedMotion || false,
          bgmStyle: user.bgmStyle || null,
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchSettings();
  }, [session, fetchSettings]);

  const saveSettings = async (updates: Partial<UserSettings>) => {
    setSaving(true);
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        toast.success('Settings saved');
        update();
      } else {
        toast.error('Failed to save settings');
        setSettings(settings); // revert
      }
    } catch {
      toast.error('Network error');
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl px-4 pt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 rounded bg-[var(--rhythm-bg-card)]" />
            <div className="h-40 rounded-2xl bg-[var(--rhythm-bg-card)]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-24">
        <h2 className="text-2xl font-bold text-[var(--rhythm-neutral-50)] mb-6">Settings</h2>

        {/* Learning Settings */}
        <div className="mb-6 rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-300)] mb-4">Learning</h3>
          <div className="space-y-4">
            {/* Accent */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--rhythm-neutral-200)]">Accent</p>
                <p className="text-xs text-[var(--rhythm-neutral-500)]">Pronunciation style</p>
              </div>
              <select
                value={settings.accent}
                onChange={(e) => saveSettings({ accent: e.target.value })}
                className="rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] px-4 py-2 text-sm text-[var(--rhythm-neutral-200)] outline-none focus:border-[var(--rhythm-primary)]/50"
              >
                <option value="en-US">US English</option>
                <option value="en-GB">UK English</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--rhythm-neutral-200)]">Difficulty</p>
                <p className="text-xs text-[var(--rhythm-neutral-500)]">Question difficulty level</p>
              </div>
              <select
                value={settings.difficulty}
                onChange={(e) => saveSettings({ difficulty: e.target.value })}
                className="rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] px-4 py-2 text-sm text-[var(--rhythm-neutral-200)] outline-none focus:border-[var(--rhythm-primary)]/50"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Grade */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--rhythm-neutral-200)]">Grade</p>
                <p className="text-xs text-[var(--rhythm-neutral-500)]">Current grade level</p>
              </div>
              <select
                value={settings.grade}
                onChange={(e) => saveSettings({ grade: parseInt(e.target.value) })}
                className="rounded-xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-elevated)] px-4 py-2 text-sm text-[var(--rhythm-neutral-200)] outline-none focus:border-[var(--rhythm-primary)]/50"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="mb-6 rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-300)] mb-4">Audio</h3>
          <div className="space-y-5">
            {/* Master Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--rhythm-neutral-200)]">Master Volume</p>
                <span className="text-xs text-[var(--rhythm-neutral-400)] font-[Orbitron]">
                  {Math.round(settings.globalVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(settings.globalVolume * 100)}
                onChange={(e) => {
                  const v = parseInt(e.target.value) / 100;
                  setSettings((s) => ({ ...s, globalVolume: v }));
                }}
                onMouseUp={() => saveSettings({ globalVolume: settings.globalVolume })}
                onTouchEnd={() => saveSettings({ globalVolume: settings.globalVolume })}
                className="w-full h-2 rounded-full bg-[var(--rhythm-bg-elevated)] appearance-none cursor-pointer accent-[var(--rhythm-primary)]"
              />
            </div>

            {/* BGM Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--rhythm-neutral-200)]">BGM Volume</p>
                <span className="text-xs text-[var(--rhythm-neutral-400)] font-[Orbitron]">
                  {Math.round(settings.bgmVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(settings.bgmVolume * 100)}
                onChange={(e) => {
                  const v = parseInt(e.target.value) / 100;
                  setSettings((s) => ({ ...s, bgmVolume: v }));
                }}
                onMouseUp={() => saveSettings({ bgmVolume: settings.bgmVolume })}
                onTouchEnd={() => saveSettings({ bgmVolume: settings.bgmVolume })}
                className="w-full h-2 rounded-full bg-[var(--rhythm-bg-elevated)] appearance-none cursor-pointer accent-[var(--rhythm-secondary)]"
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--rhythm-neutral-200)]">SFX Volume</p>
                <span className="text-xs text-[var(--rhythm-neutral-400)] font-[Orbitron]">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(settings.sfxVolume * 100)}
                onChange={(e) => {
                  const v = parseInt(e.target.value) / 100;
                  setSettings((s) => ({ ...s, sfxVolume: v }));
                }}
                onMouseUp={() => saveSettings({ sfxVolume: settings.sfxVolume })}
                onTouchEnd={() => saveSettings({ sfxVolume: settings.sfxVolume })}
                className="w-full h-2 rounded-full bg-[var(--rhythm-bg-elevated)] appearance-none cursor-pointer accent-[var(--rhythm-warning)]"
              />
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="mb-6 rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-300)] mb-4">Accessibility</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--rhythm-neutral-200)]">Reduced Motion</p>
              <p className="text-xs text-[var(--rhythm-neutral-500)]">Minimize animations</p>
            </div>
            <button
              onClick={() => saveSettings({ reducedMotion: !settings.reducedMotion })}
              className={`
                relative w-12 h-7 rounded-full transition-colors duration-200
                ${settings.reducedMotion
                  ? 'bg-[var(--rhythm-primary)]'
                  : 'bg-[var(--rhythm-bg-elevated)] border border-[var(--rhythm-bg-border)]'
                }
              `}
            >
              <div className={`
                absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200
                ${settings.reducedMotion ? 'translate-x-5' : 'translate-x-0.5'}
              `} />
            </button>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl border border-[var(--rhythm-bg-border)] bg-[var(--rhythm-bg-card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--rhythm-neutral-300)] mb-3">About</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--rhythm-neutral-400)]">Version</span>
              <span className="text-[var(--rhythm-neutral-200)] font-[Orbitron]">v0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--rhythm-neutral-400)]">App</span>
              <span className="text-[var(--rhythm-neutral-200)]">RhythmWord</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--rhythm-neutral-400)]">Framework</span>
              <span className="text-[var(--rhythm-neutral-200)]">Next.js 14</span>
            </div>
          </div>
        </div>

        {saving && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--rhythm-primary)]/20 text-sm text-[var(--rhythm-primary-light)] backdrop-blur-sm">
            Saving...
          </div>
        )}
      </div>
    </AppLayout>
  );
}
