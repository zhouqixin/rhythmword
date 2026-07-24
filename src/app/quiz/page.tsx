'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useTTS, getDifficultyRate } from '@/lib/audio/useTTS';
import { useQuizSounds } from '@/lib/audio/useQuizSounds';
import { renderHintedSentence, renderBlankSentence } from '@/lib/quiz-render';
import LetterSlot from '@/components/quiz/LetterSlot';
import ComboCounter from '@/components/quiz/ComboCounter';
import ResultOverlay from '@/components/quiz/ResultOverlay';
import BeatVisualizer from '@/components/quiz/BeatVisualizer';
import ConsolationCard from '@/components/quiz/ConsolationCard';
import MilestoneShoutout from '@/components/quiz/MilestoneShoutout';
import Ceremony from '@/components/ceremony/Ceremony';
import { cn } from '@/lib/utils';

/** Replace ___ with the actual target word for natural TTS reading */
function readableSentence(q: { sentenceEn: string; targetWord: string }): string {
  return q.sentenceEn.replace('___', q.targetWord);
}

/** Compare user input vs correct answer, return per-slot error flags */
function getSlotErrors(userInput: string[], correctAnswer: string): boolean[] {
  const correct = correctAnswer.toLowerCase();
  const maxLen = Math.max(userInput.length, correctAnswer.length);
  return Array.from({ length: maxLen }, (_, i) => {
    if (i >= correctAnswer.length) return true;  // extra input is wrong
    if (i >= userInput.length) return true;       // missing input is wrong
    return userInput[i].toLowerCase() !== correct[i];
  });
}

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

  const { isSpeaking, speak } = useTTS({ accent: 'en-US', rate: -45 });
  const { playKeyTap, playSuccess, playFailure } = useQuizSounds();
  const inputRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const spokenQuestionId = useRef<string | null>(null);
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

  // Speak the COMPLETE sentence ONCE when a new question appears
  useEffect(() => {
    if (state.phase === 'playing' && state.currentQuestion) {
      const q = state.currentQuestion;
      if (spokenQuestionId.current !== q.id) {
        spokenQuestionId.current = q.id;
        const diffRate = getDifficultyRate(q.difficulty || 'medium');
        speak(readableSentence(q), diffRate);
      }
    }
  }, [state.phase, state.currentQuestion, speak]);

  // Keyboard input + key tap sound
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Result phase: let ResultOverlay handle Enter, block all other keys
      if (state.phase === 'result') return;
      if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); return; }
      if (state.phase !== 'playing') return;
      if (e.key === 'Backspace') { e.preventDefault(); handleBackspace(); return; }
      if (/^[a-zA-Z]$/.test(e.key) && e.key.length === 1) {
        e.preventDefault();
        handleKeyInput(e.key);
        playKeyTap(); // Kick Pulse on every keystroke
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, handleKeyInput, handleBackspace, submitAnswer, playKeyTap]);

  // Play success/failure jingle when result phase is entered
  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    if (state.phase === 'result' && prevPhaseRef.current !== 'result' && state.lastResult) {
      if (state.lastResult.isCorrect) {
        playSuccess();
      } else {
        playFailure();
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.lastResult, playSuccess, playFailure]);

  const handleExit = useCallback(() => {
    if (state.questionIndex > 0) {
      toast('Exit training? Progress will be lost.', {
        action: { label: 'Confirm', onClick: () => router.push('/') },
      });
    } else {
      router.push('/');
    }
  }, [state.questionIndex, router]);

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

  const { currentQuestion, questionIndex, userInput, activeSlot, combo, comboState, phase, lastResult, showConsolation, brokenCombo, hintPositions, shakeInput } = state;

  // Compute per-slot error positions when showing wrong answer
  const slotErrors = useMemo(() => {
    if (phase === 'result' && lastResult && !lastResult.isCorrect && currentQuestion) {
      return getSlotErrors(userInput, lastResult.correctAnswer);
    }
    return null;
  }, [phase, lastResult, currentQuestion, userInput]);

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
        <div className="mb-6">
          <ComboCounter combo={combo} comboState={comboState} />
        </div>

        <div className="mb-6">
          <BeatVisualizer
            bpm={currentQuestion?.bpm || 90}
            isPlaying={phase === 'playing'}
          />
        </div>

        {/* Sentence + translation + replay */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xl font-medium text-[var(--rhythm-neutral-100)]">
            {currentQuestion && hintPositions.length > 0
              ? renderHintedSentence(currentQuestion.sentenceEn, currentQuestion.targetWord, hintPositions)
              : currentQuestion
                ? renderBlankSentence(currentQuestion.sentenceEn, currentQuestion.blankCount)
                : ''}
          </p>
          {currentQuestion?.sentenceZh && (
            <p className="mb-3 text-sm text-[var(--rhythm-neutral-500)]">
              {currentQuestion.sentenceZh}
            </p>
          )}
          <button
            onClick={() => {
              if (currentQuestion) {
                const diffRate = getDifficultyRate(currentQuestion.difficulty || 'medium');
                speak(readableSentence(currentQuestion), diffRate);
              }
            }}
            disabled={isSpeaking}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all
              text-[var(--rhythm-neutral-400)] hover:text-[var(--rhythm-primary-light)]
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSpeaking ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-[var(--rhythm-neutral-400)] border-t-transparent rounded-full animate-spin" />
                Speaking...
              </>
            ) : (
              '🔊 Replay'
            )}
          </button>
        </div>

        {/* Letter slots — full word with hints */}
        <div className="mb-2 text-center">
          <p className="mb-4 text-sm text-[var(--rhythm-neutral-400)]">
            Type the missing letters
          </p>
          <div
            className={cn(
              'flex items-center justify-center gap-2',
              shakeInput && 'animate-shake'
            )}
            ref={inputRef}
          >
            {currentQuestion && userInput.map((char, i) => {
              const isHint = hintPositions.includes(i);
              return (
                <LetterSlot
                  key={i}
                  value={char}
                  index={i}
                  isActive={i === activeSlot && phase === 'playing'}
                  isHint={isHint}
                  isCorrect={lastResult?.isCorrect ? true : null}
                  isError={lastResult && !lastResult.isCorrect ? true : null}
                  errorPositions={slotErrors || undefined}
                />
              );
            })}
          </div>
        </div>

        <button
          onClick={submitAnswer}
          disabled={phase === 'submitting'}
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
