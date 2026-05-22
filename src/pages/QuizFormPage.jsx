import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import QuestionEditor from '@/components/quiz/QuestionEditor'
import EcoBackground from '@/components/ui/EcoBackground'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { createQuiz, fetchQuizById, updateQuiz } from '@/services/quizService'
import { OPTIONS_PER_QUESTION, QUIZ_STATUS, ROUTES } from '@/utils/constants'
import {
  createDefaultQuestions,
  createEmptyQuestion,
  hasValidationErrors,
  validateQuizForm,
} from '@/utils/quizHelpers'

function mapQuestionsFromDb(questions) {
  return questions.map((q, index) => {
    const options = Array.isArray(q.options) ? [...q.options] : []
    while (options.length < OPTIONS_PER_QUESTION) options.push('')

    return {
      clientId: q.id,
      id: q.id,
      question_text: q.question_text,
      options,
      correct_answer: q.correct_answer,
      order_index: index,
      time_limit_seconds: q.time_limit_seconds ?? 30,
    }
  })
}

export default function QuizFormPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const isCreate = pathname.endsWith('/new')
  const isEdit = !isCreate && Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(QUIZ_STATUS.DRAFT)
  const [questions, setQuestions] = useState(() => createDefaultQuestions())
  const [errors, setErrors] = useState({})

  const loadQuiz = useCallback(async () => {
    if (!isEdit || !id) return

    setLoading(true)
    setLoadError('')

    try {
      const quiz = await fetchQuizById(id)
      setTitle(quiz.title)
      setDescription(quiz.description || '')
      setStatus(quiz.status)
      setQuestions(
        quiz.questions?.length
          ? mapQuestionsFromDb(quiz.questions)
          : createDefaultQuestions(),
      )
    } catch (err) {
      const message = err.message || 'Quiz not found'
      setLoadError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [id, isEdit])

  useEffect(() => {
    if (isCreate) {
      setLoading(false)
      return
    }
    loadQuiz()
  }, [isCreate, loadQuiz])

  function updateQuestion(index, updated) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updated : q)))
  }

  function moveQuestion(index, direction) {
    setQuestions((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((q, i) => ({ ...q, order_index: i }))
    })
  }

  function removeQuestion(index) {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, order_index: i })),
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length)])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateQuizForm({ title, questions })
    setErrors(validationErrors)

    if (hasValidationErrors(validationErrors)) {
      toast.error('Please fix the form errors')
      return
    }

    if (!user?.id) {
      toast.error('You must be logged in to save a quiz')
      return
    }

    setSaving(true)
    try {
      const payload = { title, description, status, questions }

      if (isEdit) {
        await updateQuiz(id, payload)
        toast.success('Quiz updated')
      } else {
        await createQuiz({ ...payload, adminId: user.id })
        toast.success('Quiz created')
      }
      navigate(ROUTES.QUIZZES)
    } catch (err) {
      toast.error(err.message || 'Failed to save quiz')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <EcoBackground />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col items-center justify-center gap-4 py-20"
        >
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-300">Loading quiz…</p>
        </motion.div>
      </div>
    )
  }

  if (loadError && isEdit) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <EcoBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mx-auto max-w-md space-y-4 py-20 text-center"
        >
          <p className="text-red-400">{loadError}</p>
          <Link to={ROUTES.QUIZZES}>
            <Button variant="secondary">Back to quizzes</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      <EcoBackground />

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to={ROUTES.QUIZZES}
              className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-2 mb-4"
            >
              ← Back to quizzes
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className="text-gradient">
                {isEdit ? 'Edit Quiz' : 'Create Quiz'}
              </span>
            </h1>
          </motion.div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-3xl border border-white/20 p-8 backdrop-blur-2xl space-y-6"
            >
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📋</span> Quiz Details
              </h2>
              <Input
                id="title"
                label="Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Pollution Awareness Challenge"
                error={errors.title}
                required
              />
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-emerald-300"
                >
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Learn about environmental pollution and climate impact..."
                  className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all"
                />
              </div>
              <div>
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-emerald-300">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all"
                >
                  <option value={QUIZ_STATUS.DRAFT}>📝 Draft</option>
                  <option value={QUIZ_STATUS.PUBLISHED}>✅ Published</option>
                  <option value={QUIZ_STATUS.ARCHIVED}>📦 Archived</option>
                </select>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>❓</span> Questions
                </h2>
                <Button
                  type="button"
                  className="eco-gradient text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
                  size="sm"
                  onClick={addQuestion}
                >
                  ➕ Add Question
                </Button>
              </div>
              {errors.questions && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2"
                >
                  {errors.questions}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
                className="space-y-6"
              >
                {questions.map((q, index) => (
                  <motion.div
                    key={q.clientId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <QuestionEditor
                      question={q}
                      index={index}
                      total={questions.length}
                      errors={errors}
                      onChange={(updated) => updateQuestion(index, updated)}
                      onMoveUp={() => moveQuestion(index, -1)}
                      onMoveDown={() => moveQuestion(index, 1)}
                      onRemove={() => removeQuestion(index)}
                      canRemove={questions.length > 1}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-4 border-t border-white/10 pt-8"
            >
              <Button
                type="submit"
                className="eco-gradient text-white font-semibold px-8 py-3 rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                disabled={saving}
              >
                {saving ? '💾 Saving…' : isEdit ? '✏️ Save Changes' : '✨ Create Quiz'}
              </Button>
              <Link to={ROUTES.QUIZZES}>
                <Button type="button" variant="secondary" className="px-8 py-3 rounded-2xl">
                  Cancel
                </Button>
              </Link>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}
