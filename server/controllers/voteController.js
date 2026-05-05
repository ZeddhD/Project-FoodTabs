import Vote from '../models/Vote.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import { sendResponse, sendError } from '../utils/helpers.js';

// Map parentType → Mongoose model
const MODELS = { Post, Comment, Review };

async function adjustCount(parentType, parentId, delta) {
  const Model = MODELS[parentType];
  if (Model) await Model.findByIdAndUpdate(parentId, { $inc: { likeCount: delta } });
}

/**
 * POST /api/votes
 * Body: { parentId, parentType: 'Post'|'Comment'|'Review', value: 1|-1 }
 *
 * - If the user hasn't voted: create vote, increment likeCount.
 * - If the user voted the same way: remove vote (toggle off), decrement.
 * - If the user voted differently: flip vote, adjust likeCount by diff.
 */
export const castVote = async (req, res, next) => {
  try {
    const { parentId, parentType, value } = req.body;
    const userId = req.user.userId;

    if (!['Post', 'Comment', 'Review'].includes(parentType)) {
      return sendError(res, 400, 'parentType must be Post, Comment, or Review');
    }

    const numValue = Number(value);
    if (![1, -1].includes(numValue)) {
      return sendError(res, 400, 'value must be 1 (upvote) or -1 (downvote)');
    }

    if (!parentId) {
      return sendError(res, 400, 'parentId is required');
    }

    const existing = await Vote.findOne({ userId, parentId, parentType });

    if (existing) {
      if (existing.value === numValue) {
        // Same vote — toggle off
        await Vote.findByIdAndDelete(existing._id);
        await adjustCount(parentType, parentId, -numValue);
        return sendResponse(res, 200, true, 'Vote removed');
      }
      // Different value — flip
      const diff = numValue - existing.value; // e.g. 1 - (-1) = +2
      existing.value = numValue;
      await existing.save();
      await adjustCount(parentType, parentId, diff);
      return sendResponse(res, 200, true, 'Vote updated', existing);
    }

    // New vote
    const vote = await Vote.create({ userId, parentId, parentType, value: numValue });
    await adjustCount(parentType, parentId, numValue);

    sendResponse(res, 201, true, 'Vote cast', vote);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/votes
 * Query: { parentId, parentType }
 */
export const getVotes = async (req, res, next) => {
  try {
    const { parentId, parentType } = req.query;

    const filter = {};
    if (parentId)   filter.parentId   = parentId;
    if (parentType) filter.parentType = parentType;

    const votes = await Vote.find(filter);
    sendResponse(res, 200, true, 'Votes fetched', votes);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/votes/user-vote?parentId=&parentType=
 * Returns the current user's vote on a specific item (or null).
 */
export const getUserVote = async (req, res, next) => {
  try {
    const { parentId, parentType } = req.query;
    const vote = await Vote.findOne({ userId: req.user.userId, parentId, parentType });
    sendResponse(res, 200, true, 'User vote fetched', vote || null);
  } catch (error) {
    next(error);
  }
};
