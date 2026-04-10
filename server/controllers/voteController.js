import Vote from '../models/Vote.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import { sendResponse, sendError } from '../utils/helpers.js';

export const createVote = async (req, res, next) => {
  try {
    const { postId, commentId, reviewId, voteType } = req.body;

    // Validate input
    if (!['upvote', 'downvote'].includes(voteType)) {
      return sendError(res, 400, 'voteType must be upvote or downvote');
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

    // Check if user already voted
    let existingVote = await Vote.findOne({
      userId: req.user.userId,
      [type + 'Id']: targetId
    });

    if (existingVote) {
      // Toggle vote or change vote type
      if (existingVote.voteType === voteType) {
        // Remove vote
        await Vote.findByIdAndDelete(existingVote._id);
        
        // Decrement count
        if (type === 'post') {
          await Post.findByIdAndUpdate(
            targetId,
            { $inc: { likeCount: voteType === 'upvote' ? -1 : 0 } }
          );
        } else if (type === 'comment') {
          await Comment.findByIdAndUpdate(
            targetId,
            { $inc: { likeCount: voteType === 'upvote' ? -1 : 0 } }
          );
        } else if (type === 'review') {
          await Review.findByIdAndUpdate(
            targetId,
            { $inc: { likeCount: voteType === 'upvote' ? -1 : 0 } }
          );
        }

        return sendResponse(res, 200, true, 'Vote removed');
      } else {
        // Change vote type
        existingVote.voteType = voteType;
        await existingVote.save();
        
        return sendResponse(res, 200, true, 'Vote updated', existingVote);
      }
    }

    // Create new vote
    const vote = new Vote({
      userId: req.user.userId,
      [type + 'Id']: targetId,
      type,
      voteType
    });

    await vote.save();

    // Increment count for upvote
    if (voteType === 'upvote') {
      if (type === 'post') {
        await Post.findByIdAndUpdate(targetId, { $inc: { likeCount: 1 } });
      } else if (type === 'comment') {
        await Comment.findByIdAndUpdate(targetId, { $inc: { likeCount: 1 } });
      } else if (type === 'review') {
        await Review.findByIdAndUpdate(targetId, { $inc: { likeCount: 1 } });
      }
    }

    sendResponse(res, 201, true, 'Vote created', vote);
  } catch (error) {
    next(error);
  }
};

export const getVotes = async (req, res, next) => {
  try {
    const { postId, commentId, reviewId } = req.query;

    let filter = {};
    if (postId) filter.postId = postId;
    if (commentId) filter.commentId = commentId;
    if (reviewId) filter.reviewId = reviewId;

    const votes = await Vote.find(filter);
    
    sendResponse(res, 200, true, 'Votes fetched', votes);
  } catch (error) {
    next(error);
  }
};
