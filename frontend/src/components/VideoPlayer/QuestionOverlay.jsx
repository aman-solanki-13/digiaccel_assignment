import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';

export function QuestionOverlay({ question, onSubmit, isSubmitting }) {
    const [selected, setSelected] = useState([]);
    const [shortAnswer, setShortAnswer] = useState('');
    const [result, setResult] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    const isChoice =
        question.type === 'single_choice' ||
        question.type === 'multiple_choice';

    const canSubmit = isChoice
        ? selected.length > 0
        : shortAnswer.trim().length > 0;

    const isLocked = Boolean(result) || isSubmitting;

    const toggleOption = (optionId) => {
        if (isLocked) {
            return;
        }

        if (question.type === 'single_choice') {
            setSelected([optionId]);
            return;
        }

        setSelected((prev) =>
            prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId],
        );
    };

    const handleSubmit = async () => {
        if (!canSubmit || isSubmitting || result) {
            return;
        }

        setSubmitError(null);

        const answer = isChoice
            ? question.type === 'single_choice'
                ? selected[0]
                : selected
            : shortAnswer.trim();

        try {
            const response = await onSubmit(answer);

            setResult({
                isCorrect: response.isCorrect,
            });
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Unable to submit your answer. Please try again.';

            setSubmitError(message);
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink-900/80 p-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center gap-2">
                    <span className="inline-flex h-6 items-center rounded-full bg-accent-100 px-2.5 text-xs font-semibold text-accent-700">
                        Quiz moment
                    </span>
                </div>

                <h3 className="mb-5 font-display text-lg font-semibold text-ink-900">
                    {question.text}
                </h3>

                {isChoice ? (
                    <div className="space-y-2">
                        {question.options.map((opt) => {
                            const isSelected = selected.includes(opt.id);

                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => toggleOption(opt.id)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                                        isSelected
                                            ? 'border-brand-500 bg-brand-50 text-brand-800'
                                            : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300',
                                        isLocked && 'cursor-not-allowed opacity-70',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-4 w-4 items-center justify-center border-2',
                                            question.type === 'single_choice'
                                                ? 'rounded-full'
                                                : 'rounded',
                                            isSelected
                                                ? 'border-brand-600 bg-brand-600'
                                                : 'border-ink-300',
                                        )}
                                    >
                                        {isSelected && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </span>

                                    {opt.text}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={shortAnswer}
                        onChange={(e) => setShortAnswer(e.target.value)}
                        disabled={isLocked}
                        placeholder="Type your answer..."
                        className="h-11 w-full rounded-xl border border-ink-200 px-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50"
                    />
                )}

                {submitError && (
                    <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {submitError}
                    </div>
                )}

                {result && (
                    <div
                        className={cn(
                            'mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
                            result.isCorrect
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700',
                        )}
                    >
                        {result.isCorrect ? (
                            <CheckCircle2 size={18} />
                        ) : (
                            <XCircle size={18} />
                        )}

                        {result.isCorrect
                            ? 'Correct! Video will resume.'
                            : 'Not quite — video will resume.'}
                    </div>
                )}

                <div className="mt-5 flex justify-end">
                    {!result ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitting}
                            isLoading={isSubmitting}
                        >
                            Submit answer
                        </Button>
                    ) : (
                        <span className="text-xs text-ink-400">
                            Already answered. Resuming shortly...
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
