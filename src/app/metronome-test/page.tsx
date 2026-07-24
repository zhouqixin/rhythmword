'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface SoundPreset {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  play: (ctx: AudioContext, now: number) => void;
}

const PRESETS: SoundPreset[] = [
  {
    id: 'click',
    name: 'Classic Click',
    emoji: '⏰',
    desc: 'Traditional metronome tick',
    play: (ctx, now) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.02);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.04);
    },
  },
  {
    id: 'wood',
    name: 'Wood Block',
    emoji: '🪵',
    desc: 'Warm wooden knock',
    play: (ctx, now) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.08);
    },
  },
  {
    id: 'hihat',
    name: 'Hi-Hat',
    emoji: '🎵',
    desc: 'Crisp electronic hi-hat',
    play: (ctx, now) => {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'highpass';
      bandpass.frequency.setValueAtTime(6000, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      src.connect(bandpass); bandpass.connect(gain); gain.connect(ctx.destination);
      src.start(now); src.stop(now + 0.05);
    },
  },
  {
    id: 'beep',
    name: 'Digital Beep',
    emoji: '💻',
    desc: 'Clean electronic beep',
    play: (ctx, now) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.07);
    },
  },
  {
    id: 'snap',
    name: 'Finger Snap',
    emoji: '🤏',
    desc: 'Sharp finger snap',
    play: (ctx, now) => {
      const bufferSize = ctx.sampleRate * 0.03;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(4000, now);
      bandpass.Q.setValueAtTime(0.5, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      src.connect(bandpass); bandpass.connect(gain); gain.connect(ctx.destination);
      src.start(now); src.stop(now + 0.03);
      const osc = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      g2.gain.setValueAtTime(0.2, now);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(g2); g2.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.04);
    },
  },
  {
    id: 'kick',
    name: 'Kick Drum',
    emoji: '🥁',
    desc: 'Deep bass thump',
    play: (ctx, now) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
    },
  },
  {
    id: 'clave',
    name: 'Clave',
    emoji: '🪘',
    desc: 'Latin percussion clave',
    play: (ctx, now) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2500, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.06);
    },
  },
  {
    id: 'ticktock',
    name: 'Tick-Tock',
    emoji: '⏱️',
    desc: 'Soft clock tick-tock',
    play: (ctx, now) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.1);
    },
  },
];

export default function MetronomeTestPage() {
  const [bpm, setBpm] = useState(90);
  const [playing, setPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState('click');
  const [volume, setVolume] = useState(50);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const beatCountRef = useRef(0);

  const ensureCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
      masterGainRef.current.gain.value = volume / 100;
    }
    return audioCtxRef.current;
  }, [volume]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const playSound = useCallback((presetId: string) => {
    try {
      const ctx = ensureCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const preset = PRESETS.find(p => p.id === presetId) || PRESETS[0];
      const now = ctx.currentTime;
      const volScale = volume / 100;
      const masterGain = ctx.createGain();
      masterGain.gain.value = volScale;
      masterGain.connect(ctx.destination);

      // Clone the preset's play logic but route through masterGain
      // Actually, simpler: just adjust the preset's internal gain values
      // We'll just play directly since presets have their own gain
      preset.play(ctx, now);
    } catch (e) {
      console.error('Sound error:', e);
    }
  }, [ensureCtx, volume]);

  const start = useCallback(() => {
    if (timerRef.current) return;
    const ms = (60 / bpm) * 1000;
    beatCountRef.current = 0;
    const ctx = ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    playSound(selectedId);
    timerRef.current = setInterval(() => playSound(selectedId), ms);
    setPlaying(true);
  }, [bpm, selectedId, playSound, ensureCtx]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
  }, []);

  const preview = useCallback((presetId: string) => {
    try {
      const ctx = ensureCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const preset = PRESETS.find(p => p.id === presetId);
      if (preset) preset.play(ctx, ctx.currentTime);
    } catch {}
  }, [ensureCtx]);

  const selectedPreset = PRESETS.find(p => p.id === selectedId);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      color: '#e0e0f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '20px 0 8px' }}>Metronome Sound Selector</h1>
      <p style={{ color: '#888', fontSize: '14px', margin: '0 0 24px' }}>
        Click any sound to preview · Pick one · Press Start
      </p>

      {/* BPM Display */}
      <div style={{
        width: '160px', height: '160px', borderRadius: '50%',
        background: playing ? 'rgba(124,58,237,0.2)' : 'rgba(45,45,68,0.6)',
        border: '3px solid ' + (playing ? '#7C3AED' : '#444'),
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px', transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: '42px', fontWeight: 900, fontFamily: 'Orbitron, monospace', color: playing ? '#7C3AED' : '#666', lineHeight: 1 }}>
          {bpm}
        </span>
        <span style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>BPM</span>
      </div>

      {/* BPM controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={() => setBpm(Math.max(40, bpm - 5))}
          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #444', background: '#1a1a2e', color: '#ccc', fontSize: '20px', cursor: 'pointer' }}>-</button>
        <input type="range" min="40" max="180" value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          style={{ width: '180px', accentColor: '#7C3AED' }} />
        <button onClick={() => setBpm(Math.min(180, bpm + 5))}
          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #444', background: '#1a1a2e', color: '#ccc', fontSize: '20px', cursor: 'pointer' }}>+</button>
      </div>

      {/* Quick BPM */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[60, 75, 90, 105, 120, 140].map(p => (
          <button key={p} onClick={() => setBpm(p)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: bpm === p ? '1px solid #7C3AED' : '1px solid #333', background: bpm === p ? 'rgba(124,58,237,0.2)' : '#1a1a2e', color: bpm === p ? '#a78bfa' : '#888', fontSize: '12px', cursor: 'pointer' }}>{p}</button>
        ))}
      </div>

      {/* Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', width: '280px' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>Vol</span>
        <input type="range" min="10" max="100" value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          style={{ flex: 1, accentColor: '#7C3AED' }} />
        <span style={{ fontSize: '12px', color: '#666', width: '32px', textAlign: 'right' }}>{volume}%</span>
      </div>

      {/* Sound Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '10px', width: '100%', maxWidth: '500px', marginBottom: '24px',
      }}>
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => { setSelectedId(p.id); preview(p.id); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              padding: '14px 10px', borderRadius: '14px',
              border: selectedId === p.id ? '2px solid #7C3AED' : '1px solid #333',
              background: selectedId === p.id ? 'rgba(124,58,237,0.15)' : '#1a1a2e',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '28px' }}>{p.emoji}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: selectedId === p.id ? '#c4b5fd' : '#ccc' }}>
              {p.name}
            </span>
            <span style={{ fontSize: '10px', color: '#666' }}>{p.desc}</span>
          </button>
        ))}
      </div>

      {/* Play/Stop */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={start} disabled={playing}
          style={{ padding: '14px 40px', borderRadius: '14px', border: 'none', background: playing ? '#333' : '#7C3AED', color: 'white', fontSize: '17px', fontWeight: 700, cursor: playing ? 'not-allowed' : 'pointer', opacity: playing ? 0.4 : 1 }}>
          ▶ Start
        </button>
        <button onClick={stop} disabled={!playing}
          style={{ padding: '14px 40px', borderRadius: '14px', border: '1px solid #444', background: '#1a1a2e', color: '#ccc', fontSize: '17px', fontWeight: 600, cursor: !playing ? 'not-allowed' : 'pointer', opacity: !playing ? 0.4 : 1 }}>
          ■ Stop
        </button>
      </div>
    </div>
  );
}
