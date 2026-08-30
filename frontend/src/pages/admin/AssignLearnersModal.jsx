import { useEffect, useMemo, useState } from 'react';

import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';

import { initials } from '../../lib/utils';

import {
    useLearners,
    useAssignments,
    useSyncAssignments,
} from '../../hooks/useAssignments';

export function AssignLearnersModal({
    isOpen,
    onClose,
    isSubmitting,
    video,
}) {
    const {
        data: learners,
        isLoading: isLearnersLoading,
    } = useLearners();

    const {
        data: assignments,
        isLoading: isAssignmentsLoading,
    } = useAssignments(
        video?._id
            ? { video: video._id }
            : undefined
    );

    const syncAssignments = useSyncAssignments();

    const [selected, setSelected] = useState([]);

    /*
     * Normalize existing assignments into learner IDs.
     */
    const assignedLearnerIds = useMemo(() => {
        if (!assignments?.length) {
            return [];
        }

        return assignments
            .map((assignment) => {
                const learner = assignment.learner;

                if (!learner) {
                    return null;
                }

                if (typeof learner === 'string') {
                    return learner.toString();
                }

                return learner._id?.toString();
            })
            .filter(Boolean);
    }, [assignments]);

    /*
     * When opening the modal, initialize the selected
     * learners from the current assignments.
     */
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (isAssignmentsLoading) {
            return;
        }

        setSelected(assignedLearnerIds);
    }, [
        isOpen,
        isAssignmentsLoading,
        assignedLearnerIds,
    ]);

    const toggle = (id) => {
        const learnerId = id.toString();

        setSelected((prev) => {
            if (prev.includes(learnerId)) {
                return prev.filter(
                    (selectedId) =>
                        selectedId !== learnerId
                );
            }

            return [...prev, learnerId];
        });
    };

    const handleAssign = async () => {
        if (!video?._id) {
            return;
        }

        try {
            await syncAssignments.mutateAsync({
                video: video._id,
                existingAssignments: assignments ?? [],
                selectedLearnerIds: selected,
            });

            onClose();
        } catch (error) {
            /*
             * Keep the modal open if the request fails.
             * The mutation's error can also be displayed here
             * if your app has a toast/error component.
             */
            console.error(
                'Failed to synchronize assignments:',
                error
            );
        }
    };

    const isLoading =
        isLearnersLoading ||
        isAssignmentsLoading;

    const submitting =
        isSubmitting ||
        syncAssignments.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign "${video?.title ?? ''}"`}
        >
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Spinner />
                </div>
            ) : !learners?.length ? (
                <p className="py-6 text-center text-sm text-ink-500">
                    No learners have registered yet.
                </p>
            ) : (
                <div className="max-h-72 space-y-1 overflow-y-auto scrollbar-thin">
                    {learners.map((learner) => {
                        const learnerId =
                            learner._id.toString();

                        const isChecked =
                            selected.includes(learnerId);

                        return (
                            <button
                                key={learnerId}
                                type="button"
                                onClick={() =>
                                    toggle(learnerId)
                                }
                                disabled={submitting}
                                className={`
                                    flex w-full items-center
                                    gap-3 rounded-lg border
                                    px-3 py-2.5 text-left
                                    transition-colors
                                    ${isChecked
                                        ? 'border-brand-500 bg-brand-50'
                                        : 'border-ink-100 hover:bg-ink-50'
                                    }
                                    ${submitting
                                        ? 'cursor-not-allowed opacity-60'
                                        : ''
                                    }
                                `}
                            >
                                <div
                                    className="
                                        flex h-8 w-8 shrink-0
                                        items-center justify-center
                                        rounded-full bg-ink-100
                                        text-xs font-semibold
                                        text-ink-600
                                    "
                                >
                                    {initials(learner.name)}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-ink-900">
                                        {learner.name}
                                    </p>

                                    <p className="truncate text-xs text-ink-400">
                                        {learner.email}
                                    </p>
                                </div>

                                <div
                                    className={`
                                        flex h-5 w-5 shrink-0
                                        items-center justify-center
                                        rounded border-2
                                        ${isChecked
                                            ? 'border-brand-600 bg-brand-600'
                                            : 'border-ink-300 bg-white'
                                        }
                                    `}
                                >
                                    {isChecked && (
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            className="h-3.5 w-3.5 text-white"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M5 10.5L8.5 14L15 6.5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-ink-400">
                    {selected.length === 0
                        ? 'No learners selected'
                        : `${selected.length} learner${selected.length === 1
                            ? ''
                            : 's'
                        } selected`}
                </p>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleAssign}
                        disabled={submitting || isLoading}
                        isLoading={submitting}
                    >
                        Save assignments
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
