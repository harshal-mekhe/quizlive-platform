import { AnimatePresence, motion } from 'framer-motion'
import CircularTimer from '@/components/ui/CircularTimer'
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
        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="space-y-8"
      >
        {/* Header with Timer */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass px-6 py-3 rounded-2xl border-2 border-emerald-500/30"
          >
            <span className="text-emerald-300 font-bold text-lg">
              📝 Question {(question.question_index ?? 0) + 1}
              {totalQuestions ? ` / ${totalQuestions}` : ''}
            </span>
          </motion.div>
          
          {timerEnabled && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CircularTimer
                timeRemaining={remainingSeconds}
                totalTime={duration}
                size="md"
              />
            </motion.div>
          )}
        </div>

        {/* Question Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-8 border-2 border-cyan-500/20"
        >
          <div className="flex items-start gap-4">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              🌍
            </motion.span>
            <h2 className="text-2xl sm:text-3xl font-bold leading-snug text-white flex-1">
              {question.question_text}
            </h2>
          </div>
        </motion.div>

        {/* Answer Options */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnswerOptions
            options={question.options ?? []}
            selected={selectedAnswer}
            onSelect={onSelectAnswer}
            disabled={!canAnswer}
            correctAnswer={question.correct_answer}
            showResults={showResults}
          />
        </motion.div>

        {/* Status Messages */}
        {submitLocked && livePhase === LIVE_PHASE.QUESTION && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center glass-strong rounded-2xl py-4 border-2 border-emerald-500/50"
          >
            <p className="text-emerald-300 font-semibold flex items-center justify-center gap-2">
              <span>✅</span>
              Answer submitted — good luck!
            </p>
          </motion.div>
        )}

        {expired && livePhase === LIVE_PHASE.QUESTION && !submitLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center glass-strong rounded-2xl py-4 border-2 border-amber-500/50"
          >
            <p className="text-amber-300 font-semibold flex items-center justify-center gap-2">
              <span>⏰</span>
              Time&apos;s up!
            </p>
          </motion.div>
        )}

        {showResults && pointsEarned != null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 2,
              }}
              className="inline-block eco-gradient rounded-3xl px-8 py-4 shadow-2xl shadow-emerald-500/50"
            >
              <p className="text-3xl font-bold text-white flex items-center gap-3">
                <span>🌟</span>
                +{pointsEarned} points
                <span>🌟</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
