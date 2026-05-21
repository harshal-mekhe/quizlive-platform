import { memo } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

function QuestionEditor({
  question,
  index,
  total,
  errors = {},
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  canRemove,
}) {
  const prefix = `question_${index}`

  function updateField(field, value) {
    onChange({ ...question, [field]: value })
  }

  function updateOption(optionIndex, value) {
    const options = [...question.options]
    options[optionIndex] = value
    const correct_answer =
      question.correct_answer === question.options[optionIndex]
        ? value
        : question.correct_answer
    onChange({ ...question, options, correct_answer })
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold text-white">Question {index + 1}</h4>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move up"
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move down"
          >
            ↓
          </Button>
          {canRemove && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Input
          id={`q-text-${index}`}
          label="Question"
          value={question.question_text}
          onChange={(e) => updateField('question_text', e.target.value)}
          placeholder="What is the capital of France?"
          error={errors[`${prefix}_text`]}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">Answer options</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((opt, optIndex) => (
              <Input
                key={optIndex}
                id={`q-${index}-opt-${optIndex}`}
                label={`Option ${optIndex + 1}`}
                value={opt}
                onChange={(e) => updateOption(optIndex, e.target.value)}
                placeholder={`Option ${optIndex + 1}`}
              />
            ))}
          </div>
          {errors[`${prefix}_options`] && (
            <p className="mt-1 text-sm text-red-400">{errors[`${prefix}_options`]}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Correct answer
          </label>
          <select
            value={question.correct_answer}
            onChange={(e) => updateField('correct_answer', e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select correct option</option>
            {question.options
              .filter((o) => o.trim())
              .map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
          {errors[`${prefix}_correct`] && (
            <p className="mt-1 text-sm text-red-400">{errors[`${prefix}_correct`]}</p>
          )}
        </div>

        <Input
          id={`q-timer-${index}`}
          label="Timer (seconds)"
          type="number"
          min={5}
          max={300}
          value={question.time_limit_seconds}
          onChange={(e) =>
            updateField('time_limit_seconds', parseInt(e.target.value, 10) || 0)
          }
          error={errors[`${prefix}_timer`]}
        />
      </div>
    </div>
  )
}

export default memo(QuestionEditor)
