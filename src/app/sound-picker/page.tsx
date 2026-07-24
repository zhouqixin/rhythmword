'use client';

import { useState, useRef, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────

interface SoundPreset {
  id: string; name: string; emoji: string; desc: string;
  play: (ctx: AudioContext, now: number, vol: number) => void;
}

interface JinglePreset {
  id: string; name: string; emoji: string; desc: string;
  play: (ctx: AudioContext, now: number, vol: number) => void;
}

interface PatternPreset {
  id: string; name: string; emoji: string; desc: string;
  beats: number[];
}

// ── Key Tap Sounds ──

const TAP_SOUNDS: SoundPreset[] = [
  {
    id: 'kick', name: 'Kick Drum', emoji: '🥁', desc: 'Deep bass 150→40Hz',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.35 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
    },
  },
  {
    id: 'wood', name: 'Wood Block', emoji: '🪵', desc: 'Warm wooden tap',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
      gain.gain.setValueAtTime(0.25 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.08);
    },
  },
  {
    id: 'click', name: 'Classic Click', emoji: '⏰', desc: 'Sharp metronome tick',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.02);
      gain.gain.setValueAtTime(0.12 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.04);
    },
  },
  {
    id: 'beep', name: 'Soft Beep', emoji: '💻', desc: 'Gentle sine beep',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.12 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.07);
    },
  },
  {
    id: 'clave', name: 'Clave', emoji: '🪘', desc: 'Bright Latin clave',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(2500, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03);
      gain.gain.setValueAtTime(0.18 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.06);
    },
  },
];

const JINGLE_SOUNDS: JinglePreset[] = [
  {
    id: 'success-chime', name: 'Bright Chime', emoji: '✨', desc: 'Ascending C5→E5',
    play: (ctx, now, vol) => {
      [523, 659].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.001, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.2 * vol, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.35);
      });
    },
  },
  {
    id: 'success-fanfare', name: 'Triumph Fanfare', emoji: '🎺', desc: 'C-E-G-C arpeggio',
    play: (ctx, now, vol) => {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.001, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.18 * vol, now + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.3);
      });
    },
  },
  {
    id: 'success-magical', name: 'Magical Sparkle', emoji: '🔮', desc: 'Shimmering chord',
    play: (ctx, now, vol) => {
      [880, 1109, 1319].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.001, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.12 * vol, now + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.05); osc.stop(now + i * 0.05 + 0.45);
      });
    },
  },
  {
    id: 'success-levelup', name: 'Level Up', emoji: '⬆️', desc: 'Game-style sweep',
    play: (ctx, now, vol) => {
      [400, 500, 600, 800, 1000].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'square'; osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.08 * vol, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.12);
      });
    },
  },
  {
    id: 'fail-buzzer', name: 'Game Buzzer', emoji: '❌', desc: 'Classic wrong-answer buzz',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.15 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.35);
    },
  },
  {
    id: 'fail-descend', name: 'Descending Slide', emoji: '📉', desc: 'Sad G4→D4',
    play: (ctx, now, vol) => {
      [392, 294].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, now + i * 0.2);
        gain.gain.setValueAtTime(0.18 * vol, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.2); osc.stop(now + i * 0.2 + 0.35);
      });
    },
  },
  {
    id: 'fail-thud', name: 'Low Thud', emoji: '💢', desc: 'Deep 80→40Hz',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
      gain.gain.setValueAtTime(0.3 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.25);
    },
  },
  {
    id: 'fail-glitch', name: 'Glitch', emoji: '💥', desc: 'Digital noise burst',
    play: (ctx, now, vol) => {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      src.connect(gain); gain.connect(ctx.destination);
      src.start(now); src.stop(now + 0.15);
    },
  },
];

const RHYTHM_SOUNDS: SoundPreset[] = [
  {
    id: 'rhythm-kick', name: 'Kick Pulse', emoji: '🥁', desc: 'Steady kick drum',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.3 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
    },
  },
  {
    id: 'rhythm-hihat', name: 'Hi-Hat Groove', emoji: '🎵', desc: 'Crisp hi-hat',
    play: (ctx, now, vol) => {
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4);
      }
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass';
      hp.frequency.setValueAtTime(8000, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      src.connect(hp); hp.connect(gain); gain.connect(ctx.destination);
      src.start(now); src.stop(now + 0.04);
    },
  },
  {
    id: 'rhythm-wood', name: 'Wood Pulse', emoji: '🪵', desc: 'Warm wooden rhythm',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
      gain.gain.setValueAtTime(0.2 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.07);
    },
  },
  {
    id: 'rhythm-clave', name: 'Clave Beat', emoji: '🪘', desc: 'Latin clave pattern',
    play: (ctx, now, vol) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.03);
      gain.gain.setValueAtTime(0.15 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.05);
    },
  },
  {
    id: 'rhythm-snare', name: 'Snare Hit', emoji: '🥢', desc: 'Snare-like hit',
    play: (ctx, now, vol) => {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 6);
      }
      const src = ctx.createBufferSource(); src.buffer = buffer;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2000, now); bp.Q.setValueAtTime(1, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      src.connect(bp); bp.connect(gain); gain.connect(ctx.destination);
      src.start(now); src.stop(now + 0.05);
      const osc = ctx.createOscillator(); const g2 = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(180, now);
      g2.gain.setValueAtTime(0.15 * vol, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(g2); g2.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.06);
    },
  },
];

const PATTERNS: PatternPreset[] = [
  { id: 'pat-44', name: '4/4 Straight', emoji: '🎯', desc: 'Four on the floor', beats: [0, 0.25, 0.5, 0.75] },
  { id: 'pat-half', name: 'Half Time', emoji: '🐢', desc: 'Slow half notes', beats: [0, 0.5] },
  { id: 'pat-offbeat', name: 'Off-beat', emoji: '🎷', desc: 'Syncopated groove', beats: [0, 0.375, 0.625] },
  { id: 'pat-tresillo', name: 'Tresillo', emoji: '💃', desc: '3+3+2 Latin feel', beats: [0, 0.375, 0.625, 0.75] },
  { id: 'pat-dotted', name: 'Dotted', emoji: '🕺', desc: 'Dotted quarter groove', beats: [0, 0.375, 0.5, 0.75] },
];

// ─── Audio Engine ──────────────────────────────────────

let _audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

// ─── Component ─────────────────────────────────────────

type TabId = 'tap' | 'rhythm' | 'jingle';

export default function SoundPickerPage() {
  const [tab, setTab] = useState<TabId>('tap');
  const [tapId, setTapId] = useState('kick');
  const [rhythmId, setRhythmId] = useState('rhythm-kick');
  const [patternId, setPatternId] = useState('pat-44');
  const [successId, setSuccessId] = useState('success-chime');
  const [failId, setFailId] = useState('fail-buzzer');
  const [volume, setVolume] = useState(70);
  const [bpm, setBpm] = useState(105);
  const [rhythmPlaying, setRhythmPlaying] = useState(false);
  const rhythmRef = useRef<number | null>(null);
  const [toast, setToast] = useState('');

  const vol = volume / 100;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1200);
  }, []);

  // ── Preview single sound ──
  const previewSound = useCallback((preset: SoundPreset | JinglePreset) => {
    const ctx = getCtx();
    preset.play(ctx, ctx.currentTime, vol);
  }, [vol]);

  // ── Rhythm loop ──
  const toggleRhythm = useCallback(() => {
    if (rhythmPlaying) {
      if (rhythmRef.current) { clearInterval(rhythmRef.current); rhythmRef.current = null; }
      setRhythmPlaying(false);
      return;
    }
    const ctx = getCtx();
    const sound = RHYTHM_SOUNDS.find(s => s.id === rhythmId) || RHYTHM_SOUNDS[0];
    const pattern = PATTERNS.find(p => p.id === patternId) || PATTERNS[0];
    const intervalMs = (60 / bpm) * 1000;
    let beatIdx = 0;

    // Play first beat immediately
    sound.play(ctx, ctx.currentTime, vol);

    rhythmRef.current = window.setInterval(() => {
      beatIdx++;
      const now = ctx.currentTime;
      sound.play(ctx, now, vol);
    }, intervalMs);

    setRhythmPlaying(true);
  }, [rhythmPlaying, rhythmId, patternId, bpm, vol]);

  // Cleanup on unmount
  const stopRhythm = useCallback(() => {
    if (rhythmRef.current) { clearInterval(rhythmRef.current); rhythmRef.current = null; }
    setRhythmPlaying(false);
  }, []);

  // ── Tab config ──
  const tabs: { id: TabId; label: string; emoji: string }[] = [
    { id: 'tap', label: 'Key Tap', emoji: '\U0001F3B9' },
    { id: 'rhythm', label: 'Rhythm Loop', emoji: '\U0001F3B5' },
    { id: 'jingle', label: 'Jingles', emoji: '\U0001F3B6' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif', padding: '24px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>\U0001F3BC Sound Picker</h1>
          <p style={{ color: '#888', marginTop: 6, fontSize: 14 }}>Preview and select all sounds for RhythmWord</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#1a1a2e', borderRadius: 12, padding: 4 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); stopRhythm(); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: 600,
                background: tab === t.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: tab === t.id ? '#fff' : '#888',
                transition: 'all 0.2s',
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Volume slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: '#1e1e36', borderRadius: 10, padding: '12px 16px' }}>
          <span style={{ fontSize: 13, color: '#999', minWidth: 56 }}>\U0001F50A Volume</span>
          <input
            type="range" min={10} max={100} value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: 13, color: '#ccc', minWidth: 36, textAlign: 'right' }}>{volume}%</span>
        </div>

        {/* ── TAP TAB ── */}
        {tab === 'tap' && (
          <div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>Sound played on every keystroke while typing your answer.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TAP_SOUNDS.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setTapId(s.id); previewSound(s); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderRadius: 10, cursor: 'pointer',
                    background: tapId === s.id ? 'linear-gradient(135deg, #312e81, #4338ca)' : '#1e1e36',
                    border: tapId === s.id ? '2px solid #6366f1' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{s.desc}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); previewSound(s); showToast('Playing ' + s.name); }}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#6366f1', color: '#fff', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    \u25B6 Test
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RHYTHM TAB ── */}
        {tab === 'rhythm' && (
          <div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>Background rhythm loop that plays after TTS reads the sentence.</p>

            {/* BPM Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: '#1e1e36', borderRadius: 10, padding: '12px 16px' }}>
              <span style={{ fontSize: 13, color: '#999', minWidth: 56 }}>\U0001F3C3 BPM</span>
              <input
                type="range" min={40} max={180} value={bpm}
                onChange={e => setBpm(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#f59e0b' }}
              />
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700, minWidth: 36, textAlign: 'right' }}>{bpm}</span>
            </div>

            {/* Rhythm sounds */}
            <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Sound:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {RHYTHM_SOUNDS.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setRhythmId(s.id); if (rhythmPlaying) { stopRhythm(); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 10, cursor: 'pointer',
                    background: rhythmId === s.id ? 'linear-gradient(135deg, #78350f, #92400e)' : '#1e1e36',
                    border: rhythmId === s.id ? '2px solid #f59e0b' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{s.desc}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); previewSound(s); showToast('Playing ' + s.name); }}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#f59e0b', color: '#000', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    \u25B6 Test
                  </button>
                </div>
              ))}
            </div>

            {/* Pattern selector */}
            <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Pattern:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {PATTERNS.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPatternId(p.id); if (rhythmPlaying) { stopRhythm(); } }}
                  style={{
                    padding: '8px 14px', borderRadius: 8, border: patternId === p.id ? '2px solid #f59e0b' : '2px solid #333',
                    cursor: 'pointer', background: patternId === p.id ? '#78350f' : '#1e1e36',
                    color: patternId === p.id ? '#fbbf24' : '#aaa', fontSize: 13, fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                >
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>

            {/* Play/Stop */}
            <button
              onClick={toggleRhythm}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                cursor: 'pointer', fontSize: 16, fontWeight: 700,
                background: rhythmPlaying
                  ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: rhythmPlaying ? '#fff' : '#000',
                transition: 'all 0.2s',
              }}
            >
              {rhythmPlaying ? '\u23F9 Stop Loop' : '\u25B6 Play Rhythm Loop'}
            </button>
          </div>
        )}

        {/* ── JINGLE TAB ── */}
        {tab === 'jingle' && (
          <div>
            {/* Success Jingles */}
            <p style={{ color: '#10b981', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>\u2705 Success Jingles</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {JINGLE_SOUNDS.filter(j => j.id.startsWith('success')).map(j => (
                <div
                  key={j.id}
                  onClick={() => { setSuccessId(j.id); previewSound(j); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 10, cursor: 'pointer',
                    background: successId === j.id ? 'linear-gradient(135deg, #064e3b, #065f46)' : '#1e1e36',
                    border: successId === j.id ? '2px solid #10b981' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{j.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{j.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{j.desc}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); previewSound(j); showToast('Playing ' + j.name); }}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#10b981', color: '#000', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    \u25B6 Test
                  </button>
                </div>
              ))}
            </div>

            {/* Failure Jingles */}
            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>\u274C Failure Jingles</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {JINGLE_SOUNDS.filter(j => j.id.startsWith('fail')).map(j => (
                <div
                  key={j.id}
                  onClick={() => { setFailId(j.id); previewSound(j); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 10, cursor: 'pointer',
                    background: failId === j.id ? 'linear-gradient(135deg, #7f1d1d, #991b1b)' : '#1e1e36',
                    border: failId === j.id ? '2px solid #ef4444' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{j.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{j.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{j.desc}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); previewSound(j); showToast('Playing ' + j.name); }}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    \u25B6 Test
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div style={{
          marginTop: 28, padding: '16px 20px', borderRadius: 12,
          background: '#1e1e36', border: '1px solid #333',
          display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13,
        }}>
          <div style={{ color: '#888', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            \U0001F4CB Current Selection
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: '#888' }}>Tap: </span>
              <span style={{ color: '#c7d2fe', fontWeight: 600 }}>
                {TAP_SOUNDS.find(s => s.id === tapId)?.emoji} {TAP_SOUNDS.find(s => s.id === tapId)?.name}
              </span>
            </div>
            <div>
              <span style={{ color: '#888' }}>Rhythm: </span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                {RHYTHM_SOUNDS.find(s => s.id === rhythmId)?.emoji} {RHYTHM_SOUNDS.find(s => s.id === rhythmId)?.name}
              </span>
            </div>
            <div>
              <span style={{ color: '#888' }}>Pattern: </span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                {PATTERNS.find(p => p.id === patternId)?.emoji} {PATTERNS.find(p => p.id === patternId)?.name}
              </span>
            </div>
            <div>
              <span style={{ color: '#888' }}>Success: </span>
              <span style={{ color: '#6ee7b7', fontWeight: 600 }}>
                {JINGLE_SOUNDS.find(j => j.id === successId)?.emoji} {JINGLE_SOUNDS.find(j => j.id === successId)?.name}
              </span>
            </div>
            <div>
              <span style={{ color: '#888' }}>Failure: </span>
              <span style={{ color: '#fca5a5', fontWeight: 600 }}>
                {JINGLE_SOUNDS.find(j => j.id === failId)?.emoji} {JINGLE_SOUNDS.find(j => j.id === failId)?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            padding: '10px 24px', borderRadius: 10, background: '#333', color: '#fff',
            fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            {toast}
          </div>
        )}

      </div>
    </div>
  );
}
