import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';

import { assignmentsApi } from '../api/assignmentsApi';

export function useLearners() {
    return useQuery({
        queryKey: ['learners'],
        queryFn: () =>
            assignmentsApi
                .listLearners()
                .then((res) => res.data.learners),
    });
}

export function useAssignments(params) {
    return useQuery({
        queryKey: ['assignments', params],
        queryFn: () =>
            assignmentsApi
                .list(params)
                .then((res) => res.data.assignments),

        enabled:
            params === undefined ||
            Boolean(params?.video),
    });
}

export function useCreateAssignments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ video, learnerIds }) => {
            return assignmentsApi.create({
                video,
                learnerIds,
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['assignments'],
            });

            queryClient.invalidateQueries({
                queryKey: ['videos'],
            });
        },
    });
}

/**
 * Synchronize the assignments for a video.
 *
 * existingAssignments:
 * [
 *   { _id: 'assignment1', learner: 'learner1', video: 'video1' },
 *   { _id: 'assignment2', learner: 'learner2', video: 'video1' }
 * ]
 *
 * selectedLearnerIds:
 * ['learner1', 'learner3']
 *
 * Result:
 * - learner1 stays assigned
 * - learner2 gets removed
 * - learner3 gets assigned
 */
export function useSyncAssignments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            video,
            existingAssignments,
            selectedLearnerIds,
        }) => {
            const existingByLearner = new Map();

            existingAssignments.forEach((assignment) => {
                const learner = assignment.learner;

                const learnerId =
                    typeof learner === 'string'
                        ? learner
                        : learner?._id;

                if (learnerId) {
                    existingByLearner.set(
                        learnerId.toString(),
                        assignment
                    );
                }
            });

            const normalizedSelectedIds = [
                ...new Set(
                    selectedLearnerIds.map((id) =>
                        id.toString()
                    )
                ),
            ];

            /*
             * Learners that are selected now but weren't
             * assigned before.
             */
            const learnersToAdd =
                normalizedSelectedIds.filter(
                    (learnerId) =>
                        !existingByLearner.has(learnerId)
                );

            /*
             * Existing assignments whose learners are
             * no longer selected.
             */
            const assignmentsToRemove =
                existingAssignments.filter((assignment) => {
                    const learner = assignment.learner;

                    const learnerId =
                        typeof learner === 'string'
                            ? learner
                            : learner?._id;

                    if (!learnerId) {
                        return false;
                    }

                    return !normalizedSelectedIds.includes(
                        learnerId.toString()
                    );
                });

            /*
             * Add newly selected learners.
             */
            if (learnersToAdd.length > 0) {
                await assignmentsApi.create({
                    video,
                    learnerIds: learnersToAdd,
                });
            }

            /*
             * Remove learners that were unchecked.
             */
            if (assignmentsToRemove.length > 0) {
                await Promise.all(
                    assignmentsToRemove.map((assignment) =>
                        assignmentsApi.remove(
                            assignment._id
                        )
                    )
                );
            }

            return {
                added: learnersToAdd,
                removed: assignmentsToRemove,
            };
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['assignments'],
            });

            queryClient.invalidateQueries({
                queryKey: ['videos'],
            });

            if (variables?.video) {
                queryClient.invalidateQueries({
                    queryKey: [
                        'assignments',
                        { video: variables.video },
                    ],
                });
            }
        },
    });
}

export function useDeleteAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) =>
            assignmentsApi.remove(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['assignments'],
            });

            queryClient.invalidateQueries({
                queryKey: ['videos'],
            });
        },
    });
}
