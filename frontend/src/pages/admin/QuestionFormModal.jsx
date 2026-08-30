import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Modal } from "../../components/common/Modal";
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';


export function QuestionFormModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    initialValues,
    presetTimestamp = 0,
}) {
    const [type, setType] = useState('single_choice');
    const [timestamp, setTimestamp] = useState('0');
    const [text, setText] = useState('');
    const [options, setOptions] = useState([{ id: 'a', text: '' }, { id: 'b', text: '' }]);
    const [correctIds, setCorrectIds] = useState([]);
    const [shortAnswer, setShortAnswer] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (initialValues) {
            setType(initialValues.type);
            setTimestamp(String(initialValues.timestamp));
            setText(initialValues.text);
            setOptions(initialValues.options ?? [{ id: 'a', text: '' }, { id: 'b', text: '' }]);
            setCorrectIds(
                initialValues.type === 'short_answer'
                    ? []
                    : Array.isArray(initialValues.correctAnswer)
                        ? initialValues.correctAnswer
                        : [initialValues.correctAnswer],
            );
            setShortAnswer(initialValues.type === 'short_answer' ? initialValues.correctAnswer : '');
        } else {
            // new question — pre-fill the timestamp from where the admin was
            // scrubbing when they clicked "Add question here"
            setType('single_choice');
            setTimestamp(String(presetTimestamp));
            setText('');
            setOptions([{ id: 'a', text: '' }, { id: 'b', text: '' }]);
            setCorrectIds([]);
            setShortAnswer('');
        }
        setError('');
    }, [isOpen, initialValues, presetTimestamp]);

    const isChoice = type === 'single_choice' || type === 'multiple_choice';

    const addOption = () => {
        const nextId = String.fromCharCode(97 + options.length);
        setOptions([...options, { id: nextId, text: '' }]);
    };

    const removeOption = (id) => {
        setOptions(options.filter((o) => o.id !== id));
        setCorrectIds(correctIds.filter((cid) => cid !== id));
    };

    const updateOptionText = (id, value) => {
        setOptions(options.map((o) => (o.id === id ? { ...o, text: value } : o)));
    };

    const toggleCorrect = (id) => {
        if (type === 'single_choice') {
            setCorrectIds([id]);
        } else {
            setCorrectIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!text.trim()) return setError('Question text is required');
        if (Number(timestamp) < 0) return setError('Timestamp must be 0 or greater');

        let payload = { timestamp: Number(timestamp), type, text: text.trim() };

        if (isChoice) {
            const cleanOptions = options.filter((o) => o.text.trim());
            if (cleanOptions.length < 2) return setError('Add at least 2 options');
            if (correctIds.length === 0) return setError('Mark at least one correct option');
            payload = {
                ...payload,
                options: cleanOptions,
                correctAnswer: type === 'single_choice' ? correctIds[0] : correctIds,
            };
        } else {
            if (!shortAnswer.trim()) return setError('Provide the expected answer');
            payload = { ...payload, correctAnswer: shortAnswer.trim() };
        }

        await onSubmit(payload);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialValues ? 'Edit question' : 'New question'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Timestamp (seconds)"
                        type="number"
                        min="0"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                    />
                    <Select label="Question type" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="single_choice">Single choice</option>
                        <option value="multiple_choice">Multiple choice</option>
                        <option value="short_answer">Short answer</option>
                    </Select>
                </div>
                {!initialValues && (
                    <p className="-mt-2 text-xs text-ink-400">
                        Timestamp pre-filled from where you clicked in the preview — adjust if needed.
                    </p>
                )}

                <Textarea label="Question text" value={text} onChange={(e) => setText(e.target.value)} placeholder="What does this video teach?" />

                {isChoice ? (
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-ink-700">Options</span>
                            <button type="button" onClick={addOption} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                                <Plus size={14} /> Add option
                            </button>
                        </div>
                        <div className="space-y-2">
                            {options.map((opt) => (
                                <div key={opt.id} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleCorrect(opt.id)}
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-semibold uppercase ${correctIds.includes(opt.id)
                                            ? 'border-brand-600 bg-brand-600 text-white'
                                            : 'border-ink-200 text-ink-400'
                                            }`}
                                        title="Mark as correct"
                                    >
                                        {opt.id}
                                    </button>
                                    <input
                                        value={opt.text}
                                        onChange={(e) => updateOptionText(opt.id, e.target.value)}
                                        placeholder="Option text"
                                        className="h-9 flex-1 rounded-lg border border-ink-200 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                                    />
                                    {options.length > 2 && (
                                        <button type="button" onClick={() => removeOption(opt.id)} className="text-ink-300 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-ink-400">Click the letter tile to mark correct option(s).</p>
                    </div>
                ) : (
                    <Input label="Expected answer" value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} placeholder="e.g. oxygen" />
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {initialValues ? 'Save changes' : 'Add question'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}