import * as assignmentService from '../services/assignment.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createAssignments = catchAsync(async (req, res) => {
    const { video, learnerIds } = req.body;
    const result = await assignmentService.createAssignments(video, learnerIds, req.user._id);
    res.status(201).json({ success: true, data: result });
});

export const listAssignments = catchAsync(async (req, res) => {
    const assignments = await assignmentService.listAssignments(req.query);
    res.status(200).json({ success: true, data: { assignments } });
});

export const deleteAssignment = catchAsync(async (req, res) => {
    await assignmentService.deleteAssignment(req.params.id);
    res.status(204).send();
});

export const listLearners = catchAsync(async (req, res) => {
    const learners = await assignmentService.listLearners();
    res.status(200).json({ success: true, data: { learners } });
});