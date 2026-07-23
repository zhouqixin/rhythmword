'use client';

// Canvas 节拍脉冲环可视化
// Tone.js Transport 驱动 + Canvas 渲染
// 三层同心圆依次扩散 → 节拍窗口到达时输入框高亮

import { useEffect, useRef } from 'react';

interface BeatVisualizerProps {
  bpm: number;
  isPlaying: boolean;
  onBeatArrive?: () => void; // 节拍到达回调
}

export default function BeatVisualizer({ bpm, isPlaying, onBeatArrive }: BeatVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringsRef = useRef<Array<{ scale: number; opacity: number }>>([]);
  const animFrameRef = useRef<number>(0);
  const lastBeatRef = useRef(0);
  const beatIntervalRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;

    beatIntervalRef.current = (60 / bpm) * 1000; // ms per beat

    // 初始化三个环
    ringsRef.current = [
      { scale: 0.3, opacity: 0.6 },
      { scale: 0.6, opacity: 0.4 },
      { scale: 0.9, opacity: 0.2 },
    ];

    const animate = (timestamp: number) => {
      if (!lastBeatRef.current) lastBeatRef.current = timestamp;

      const elapsed = timestamp - lastBeatRef.current;
      const progress = (elapsed % beatIntervalRef.current) / beatIntervalRef.current;

      // 节拍到达（progress 接近 1.0）
      if (progress > 0.95 && elapsed - lastBeatRef.current > beatIntervalRef.current * 0.9) {
        lastBeatRef.current = timestamp;
        onBeatArrive?.();
        // 重置环
        ringsRef.current = [
          { scale: 0.3, opacity: 0.6 },
          { scale: 0.6, opacity: 0.4 },
          { scale: 0.9, opacity: 0.2 },
        ];
      }

      // 更新环位置
      ringsRef.current = ringsRef.current.map((ring) => ({
        scale: ring.scale + 0.008,
        opacity: Math.max(0, ring.opacity - 0.003),
      }));

      // 绘制
      ctx.clearRect(0, 0, rect.width, rect.height);

      // 绘制背景圆（最外层）
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(45, 45, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制节拍窗口标记
      const beatAngle = progress * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius + 8, beatAngle - 0.1, beatAngle + 0.1);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 绘制三个同心脉冲环
      ringsRef.current.forEach((ring) => {
        const radius = maxRadius * ring.scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(5, radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${ring.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // 绘制中心 BPM 文字
      ctx.fillStyle = 'rgba(34, 211, 238, 0.9)';
      ctx.font = 'bold 16px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${bpm}`, centerX, centerY);

      // 进度弧
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius + 4, -Math.PI / 2, beatAngle);
      ctx.strokeStyle = `rgba(124, 58, 237, ${0.5 + progress * 0.3})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [bpm, isPlaying, onBeatArrive]);

  return (
    <canvas
      ref={canvasRef}
      className="h-40 w-40 rounded-full"
      style={{ width: 160, height: 160 }}
    />
  );
}
