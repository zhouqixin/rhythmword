'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useTTS } from '@/lib/audio/useTTS';
import LetterSlot from '@/components/quiz/LetterSlot';
import ComboCounter from '@/components/quiz/ComboCounter';
import ResultOverlay from '@/components/quiz/ResultOverlay';
import BeatVisualizer from '@/components/quiz/BeatVisualizer';
import ConsolationCard from '@/components/quiz/ConsolationCard';
import MilestoneShoutout from '@/components/quiz/MilestoneShoutout';
import Ceremony from '@/components/ceremony/Ceremony';

export default function QuizPage() {
  const router = useRouter();
  const {
    state,
    startSession,
    handleKeyInput,
    handleBackspace,
    submitAnswer,
    nextQuestion,
    dismissConsolation,
  } = useQuizSession();

  const { state: ttsState, speak } = useTTS({ accent: 'en-US' });
  const inputRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const [lastMilestone, setLastMilestone] = useState(0);
  const [ceremonyData, setCeremonyData] = useState<{
    rank: string;
    mvpWord: string | null;
    yesterdayComparison: string | null;
  } | null>(null);
  const [showCeremony, setShowCeremony] = useState(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startSession();
    }
  }, [startSession]);

  useEffect(() => {
    if (state.phase === 'playing' && state.currentQuestion) {
      speak(state.currentQuestion.sentenceEn);
    }
  }, [state.phase, state.currentQuestion, speak]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase === 'result') return;
      if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); return; }
      if (e.key === 'Backspace') { e.preventDefault(); handleBackspace(); return; }
      if (/^[a-zA-Z]$/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
        handleKeyInput(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, handleKeyInput, handleBackspace, submitAnswer]);

  const handleExit = useCallback(() => {
    if (state.questionIndex > 0) {
      toast('Exit training? Progress will be lost.', {
        action: { label: 'Confirm', onClick: () => router.push('/') },
      });
    } else {
      router.push('/');
    }
  }, [state.questionIndex, router]);

  // Save training session when finished
  useEffect(() => {
    if (state.phase === 'finished' && !showCeremony && !ceremonyData) {
      const saveSession = async () => {
        try {
          const res = await fetch('/api/training', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totalQuestions: state.questionIndex,
              correctCount: state.correctCount,
              maxCombo: state.maxCombo,
              totalScore: state.sessionScore,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setCeremonyData(data);
            setShowCeremony(true);
          }
        } catch (err) {
          console.error('Failed to save training:', err);
        }
      };
      saveSession();
    }
  }, [state.phase, showCeremony, ceremonyData, state.questionIndex, state.correctCount, state.maxCombo, state.sessionScore]);

  const { currentQuestion, questionIndex, userInput, activeSlot, combo, comboState, phase, lastResult, showConsolation, brokenCombo } = state;

  if (phase === 'idle' && !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--rhythm-bg-deep)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--rhythm-bg-border)] border-t-[var(--rhythm-primary)]" />
          <p className="text-[var(--rhythm-neutral-400)]">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    if (showCeremony && ceremonyData) {
      return (
        <Ceremony
          totalQuestions={state.questionIndex}
          correctCount={state.correctCount}
          maxCombo={state.maxCombo}
          totalScore={state.sessionScore}
          mvpWord={ceremonyData.mvpWord}
          yesterdayComparison={ceremonyData.yesterdayComparison}
        />
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--rhythm-bg-deep)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--rhythm-bg-border)] border-t-[var(--rhythm-primary)]" />
          <p className="text-[var(--rhythm-neutral-400)]">Generating your report card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--rhythm-bg-deep)]">
      <MilestoneShoutout
        combo={combo}
        lastMilestone={lastMilestone}
        onMilestoneReached={setLastMilestone}
      />

      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={handleExit} className="rounded-lg px-3 py-1.5 text-sm text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-neutral-200)]">
          &larr; Exit
        </button>
        <span className="text-sm text-[var(--rhythm-neutral-400)]">
          {questionIndex + 1}/{20}
        </span>
        <div className="flex items-center gap-2">
          {state.shields > 0 && (
            <span className="rounded-full bg-[var(--rhythm-secondary-cyan)]/20 px-2 py-0.5 font-display text-xs text-[var(--rhythm-secondary-cyan)]">
              Shield x{state.shields}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mb-8">
          <ComboCounter combo={combo} comboState={comboState} />
        </div>

        <div className="mb-8">
          <BeatVisualizer
            bpm={currentQuestion?.bpm || 90}
            isPlaying={phase === 'playing'}
          />
        </div>

        <div className="mb-8 text-center">
          <p className="mb-3 text-lg text-[var(--rhythm-neutral-200)]">
            {currentQuestion?.sentenceEn.replace('___', '_'.repeat(currentQuestion?.blankCount || 0))}
          </p>
          <button
            onClick={() => currentQuestion && speak(currentQuestion.sentenceEn)}
            disabled={ttsState === 'playing'}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-primary-light)] disabled:opacity-50"
          >
            Replay
          </button>
          <p className="mt-1 text-xs text-[var(--rhythm-neutral-600)]">{currentQuestion?.sentenceZh}</p>
        </div>

        <div className="mb-2 text-center">
          <p className="mb-4 text-sm text-[var(--rhythm-neutral-400)]">
            Type the rest of the word (first letter given)
          </p>
          <div className="flex items-center justify-center gap-2" ref={inputRef}>
            {currentQuestion && (
              <>
                <LetterSlot
                  value={currentQuestion.firstLetter.toUpperCase()}
                  index={-1}
                  isActive={false}
                  isGiven={true}
                />
                {userInput.map((char, i) => (
                  <LetterSlot
                    key={i}
                    value={char}
                    index={i}
                    isActive={i === activeSlot && phase === 'playing'}
                    isCorrect={lastResult?.isCorrect ? true : null}
                    isError={lastResult && !lastResult.isCorrect ? true : null}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <button
          onClick={submitAnswer}
          disabled={phase === 'submitting' || userInput.every((c) => c === '')}
          className="mt-8 rounded-xl bg-[var(--rhythm-primary)] px-10 py-3 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {phase === 'submitting' ? 'Judging...' : 'Submit (Enter)'}
        </button>
      </div>

      {phase === 'result' && lastResult && (
        <ResultOverlay result={lastResult} combo={combo} comboState={comboState} questionIndex={questionIndex} onNext={nextQuestion} />
      )}

      {showConsolation && (
        <ConsolationCard brokenCombo={brokenCombo} onDismiss={dismissConsolation} />
      )}
    </div>
  );
}
