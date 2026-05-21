import { AnimatePresence, motion } from 'framer-motion'
import QuizTimer from '@/components/live/QuizTimer'
import AnswerOptions from '@/components/live/AnswerOptions'
import { LIVE_PHASE } from '@/utils/constants'
import { useQuestionTimer } from '@/hooks/useQuestionTimer'

export default function QuestionCard({
  question,
  questionStartedAt,
  livePhase,
  selectedAnswer,
  onSelectAnswer,
  submitLocked,
  totalQuestions,
  pointsEarned,
}) {
  const duration = question?.time_limit_seconds ?? 30
  const timerEnabled = livePhase === LIVE_PHASE.QUESTION
  const { remainingSeconds, expired, progress } = useQuestionTimer(
    questionStartedAt,
    duration,
    timerEnabled,
  )

  const canAnswer =
    livePhase === LIVE_PHASE.QUESTION && !submitLocked && !expired
  const showResults = livePhase === LIVE_PHASE.REVEAL || livePhase === LIVE_PHASE.LEADERBOARD

  if (!question) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-400">
            Question {(question.question_index ?? 0) + 1}
            {totalQuestions ? ` / ${totalQuestions}` : ''}
          </span>
          {timerEnabled && (
            <QuizTimer
              remainingSeconds={remainingSeconds}
              progress={progress}
              urgent={remainingSeconds <= 3}
            />
          )}
        </div>

        <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
          {question.question_text}
        </h2>

        <AnswerOptions
          options={question.options ?? []}
          selected={selectedAnswer}
          onSelect={onSelectAnswer}
          disabled={!canAnswer}
          correctAnswer={question.correct_answer}
          showResults={showResults}
        />

        {submitLocked && livePhase === LIVE_PHASE.QUESTION && (
          <p className="text-center text-sm text-emerald-400">Answer submitted — good luck!</p>
        )}

        {expired && livePhase === LIVE_PHASE.QUESTION && !submitLocked && (
          <p className="text-center text-sm text-amber-400">Time&apos;s up!</p>
        )}

        {showResults && pointsEarned != null && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-lg font-semibold text-brand-300"
          >
            +{pointsEarned} points
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
