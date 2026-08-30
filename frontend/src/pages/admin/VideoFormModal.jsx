import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UploadCloud, Film, Image as ImageIcon } from 'lucide-react';
import { Modal } from "../../components/common/Modal";
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { uploadApi } from '../../api/uploadApi';
import { resolveMediaUrl, formatTimestamp } from '../../lib/utils';

const schema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional(),
});

export function VideoFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialValues }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) });

    const videoInputRef = useRef(null);
    const thumbInputRef = useRef(null);

    const [videoFile, setVideoFile] = useState(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
    const [thumbFile, setThumbFile] = useState(null);
    const [thumbPreviewUrl, setThumbPreviewUrl] = useState('');
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [videoUploadPct, setVideoUploadPct] = useState(0);
    const [thumbUploadPct, setThumbUploadPct] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        reset({ title: initialValues?.title ?? '', description: initialValues?.description ?? '' });
        setVideoFile(null);
        setThumbFile(null);
        setVideoPreviewUrl(initialValues?.videoUrl ? resolveMediaUrl(initialValues.videoUrl) : '');
        setThumbPreviewUrl(initialValues?.thumbnail ? resolveMediaUrl(initialValues.thumbnail) : '');
        setDurationSeconds(initialValues?.durationSeconds ?? 0);
        setVideoUploadPct(0);
        setThumbUploadPct(0);
        setError('');
    }, [isOpen, initialValues, reset]);

    const handleVideoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setVideoFile(file);
        const localUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(localUrl);

        // read duration client-side from the file itself — the admin never has
        // to measure or type it in manually
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.src = localUrl;
        probe.onloadedmetadata = () => setDurationSeconds(Math.round(probe.duration || 0));
    };

    const handleThumbSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setThumbFile(file);
        setThumbPreviewUrl(URL.createObjectURL(file));
    };

    const submit = async (data) => {
        setError('');
        if (!videoFile && !initialValues?.videoUrl) {
            setError('Please select a video file to upload');
            return;
        }

        setIsUploading(true);
        try {
            let videoUrl = initialValues?.videoUrl;
            let thumbnail = initialValues?.thumbnail ?? '';

            if (videoFile) {
                const res = await uploadApi.uploadVideo(videoFile, setVideoUploadPct);
                videoUrl = res.data.url;
            }
            if (thumbFile) {
                const res = await uploadApi.uploadThumbnail(thumbFile, setThumbUploadPct);
                thumbnail = res.data.url;
            }

            await onSubmit({ ...data, videoUrl, thumbnail, durationSeconds });
            onClose();
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const busy = isSubmitting || isUploading;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialValues ? 'Edit video' : 'Upload a new video'}
            className="max-w-xl"
        >
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
                {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

                <Input label="Title" placeholder="Introduction to Photosynthesis" error={errors.title?.message} {...register('title')} />
                <Textarea label="Description" placeholder="What will learners take away from this video?" error={errors.description?.message} {...register('description')} />

                <div>
                    <span className="mb-1.5 block text-sm font-medium text-ink-700">Video file</span>
                    {videoPreviewUrl ? (
                        <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-900">
                            <video src={videoPreviewUrl} className="max-h-48 w-full" controls />
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/50 py-8 text-ink-400 hover:border-brand-300 hover:text-brand-600"
                        >
                            <UploadCloud size={24} />
                            <span className="text-sm font-medium">Click to select a video file</span>
                            <span className="text-xs">MP4, WebM, MOV — up to 500MB</span>
                        </button>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                            <Film size={14} />
                            {videoPreviewUrl ? 'Replace video' : 'Select video'}
                        </button>
                        {durationSeconds > 0 && (
                            <span className="font-mono text-xs text-ink-400">{formatTimestamp(durationSeconds)}</span>
                        )}
                    </div>
                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
                    {isUploading && videoFile && (
                        <div className="mt-2">
                            <ProgressBar value={videoUploadPct} />
                            <p className="mt-1 text-xs text-ink-400">Uploading video... {videoUploadPct}%</p>
                        </div>
                    )}
                </div>

                <div>
                    <span className="mb-1.5 block text-sm font-medium text-ink-700">Thumbnail (optional)</span>
                    <div className="flex items-center gap-3">
                        <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
                            {thumbPreviewUrl ? (
                                <img src={thumbPreviewUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                            ) : (
                                <ImageIcon size={18} className="text-ink-300" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => thumbInputRef.current?.click()}
                            className="text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                            {thumbPreviewUrl ? 'Replace thumbnail' : 'Select thumbnail'}
                        </button>
                    </div>
                    <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbSelect} />
                    {isUploading && thumbFile && (
                        <div className="mt-2">
                            <ProgressBar value={thumbUploadPct} tone="accent" />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={busy}>
                        {busy ? (isUploading ? 'Uploading...' : 'Saving...') : initialValues ? 'Save changes' : 'Create video'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}