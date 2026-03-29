import Report from '../models/Report.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';
import { roleMiddleware } from '../middleware/auth.js';
import { notifyAllAdmins } from '../utils/notify.js';

export const createReport = async (req, res, next) => {
  try {
    const { postId, commentId, reviewId, reason, description } = req.body;

    if (!reason) {
      return sendError(res, 400, 'Reason is required');
    }

    let type;
    let targetId;

    if (postId) {
      type = 'post';
      targetId = postId;
    } else if (commentId) {
      type = 'comment';
      targetId = commentId;
    } else if (reviewId) {
      type = 'review';
      targetId = reviewId;
    } else {
      return sendError(res, 400, 'postId, commentId, or reviewId required');
    }

    const report = new Report({
      reporterId: req.user.userId,
      [type + 'Id']: targetId,
      type,
      reason,
      description
    });

    await report.save();

    // Notify all admins
    const pendingCount = await Report.countDocuments({ status: 'pending' });
    await notifyAllAdmins({
      type: 'report',
      title: `${pendingCount} report${pendingCount === 1 ? '' : 's'} pending moderation`,
      content: `A new ${type} has been flagged for "${reason}".`,
      link: '/admin/reports',
      relatedId: report._id.toString(),
    });

    // Mark item as reported
    if (type === 'post') {
      await Post.findByIdAndUpdate(targetId, { isReported: true });
    } else if (type === 'comment') {
      await Comment.findByIdAndUpdate(targetId, { isReported: true });
    } else if (type === 'review') {
      await Review.findByIdAndUpdate(targetId, { isReported: true });
    }

    sendResponse(res, 201, true, 'Report created', report);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    let filter = {};
    if (status) filter.status = status;

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('reporterId', 'name email')
      .populate('actionTakenBy', 'name');

    sendResponse(res, 200, true, 'Reports fetched', {
      reports,
      pagination: {
        total,
        page: parseInt(page) || 1,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('reporterId', 'name email')
      .populate('postId')
      .populate('commentId')
      .populate('reviewId')
      .populate('actionTakenBy', 'name');

    if (!report) {
      return sendError(res, 404, 'Report not found');
    }

    sendResponse(res, 200, true, 'Report fetched', report);
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, action } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes,
        action,
        actionTakenBy: req.user.userId,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('reporterId', 'name email');

    if (!report) {
      return sendError(res, 404, 'Report not found');
    }

    // Handle action
    if (action === 'delete') {
      if (report.type === 'post') {
        await Post.findByIdAndDelete(report.postId);
      } else if (report.type === 'comment') {
        await Comment.findByIdAndDelete(report.commentId);
      } else if (report.type === 'review') {
        await Review.findByIdAndDelete(report.reviewId);
      }
    } else if (action === 'hide') {
      const updateData = { isReported: true };
      if (report.type === 'post') {
        await Post.findByIdAndUpdate(report.postId, updateData);
      } else if (report.type === 'comment') {
        await Comment.findByIdAndUpdate(report.commentId, updateData);
      } else if (report.type === 'review') {
        await Review.findByIdAndUpdate(report.reviewId, updateData);
      }
    }

    sendResponse(res, 200, true, 'Report updated', report);
  } catch (error) {
    next(error);
  }
};
