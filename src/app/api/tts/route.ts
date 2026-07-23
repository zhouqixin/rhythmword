// GET /api/tts?text=...&accent=en-US
// Uses Microsoft Edge TTS (edge-tts) for high-quality neural voice synthesis
// Returns MP3 audio stream

import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { Readable } from 'stream';

// Voice mapping: accent → edge-tts voice name
const VOICE_MAP: Record<string, string> = {
  'en-US': 'en-US-JennyNeural',      // Female, natural American
  'en-GB': 'en-GB-SoniaNeural',      // Female, natural British
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const accent = searchParams.get('accent') || 'en-US';

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  // Sanitize text (remove very long input)
  const safeText = text.trim().substring(0, 500);
  const voice = VOICE_MAP[accent] || VOICE_MAP['en-US'];

  try {
    // Use edge-tts CLI for reliable streaming
    const args = [
      '-m', 'edge_tts',
      '--text', safeText,
      '--voice', voice,
      '--write-media', '-',  // stdout
      '--rate=+0%',
      '--pitch=+0Hz',
    ];

    const proc = spawn('python3.11', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Collect stdout chunks
    const chunks: Buffer[] = [];
    proc.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));

    const exitCode = await new Promise<number>((resolve) => {
      proc.on('close', resolve);
    });

    if (exitCode !== 0) {
      const stderr = proc.stderr.read()?.toString() || '';
      console.error('edge-tts failed:', stderr);
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
    }

    const audioBuffer = Buffer.concat(chunks);

    if (audioBuffer.length === 0) {
      return NextResponse.json({ error: 'Empty audio generated' }, { status: 500 });
    }

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache 24h
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: 'TTS service error' }, { status: 500 });
  }
}
