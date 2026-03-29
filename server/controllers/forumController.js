import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';

// ─── Posts ────────────────────────────────────────────────────────────────────

export const getPosts = async (req, res, next) => {
  try {
    const { category, search, page, limit } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    const filter = { isPublished: { $ne: false } };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort parsing
    let sort = { isPinned: -1, createdAt: -1 };
    const sortParam = req.query.sort || '-createdAt';
    if (sortParam === '-likeCount')     sort = { isPinned: -1, likeCount: -1, createdAt: -1 };
    if (sortParam === '-commentsCount') sort = { isPinned: -1, commentsCount: -1, createdAt: -1 };

    const total = await Post.countDocuments(filter);
    const posts  = await Post.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name avatar')
      .populate('linkedRestaurantId', 'name rating reviewsCount cuisineTypes');

    sendResponse(res, 200, true, 'Posts fetched', {
      posts,
      pagination: { total, page: parseInt(page) || 1, limit: limitNum, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) { next(error); }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('userId', 'name avatar');

    if (!post) return sendError(res, 404, 'Post not found');
    sendResponse(res, 200, true, 'Post fetched', post);
  } catch (error) { next(error); }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags, linkedRestaurantId, linkedDishId } = req.body;

    const post = await Post.create({
      userId: req.user.userId,
      title, content, category, tags, linkedRestaurantId, linkedDishId
    });
    await post.populate('userId', 'name avatar');

    sendResponse(res, 201, true, 'Post created', post);
  } catch (error) { next(error); }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendError(res, 404, 'Post not found');

    if (post.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const { title, content, category, tags } = req.body;
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, category, tags, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name avatar');

    sendResponse(res, 200, true, 'Post updated', updated);
  } catch (error) { next(error); }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendError(res, 404, 'Post not found');

    if (post.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    await Post.findByIdAndDelete(req.params.id);
    // Delete all comments that belong to this post
    await Comment.deleteMany({ parentId: req.params.id, parentType: 'Post' });

    sendResponse(res, 200, true, 'Post deleted');
  } catch (error) { next(error); }
};

// ─── Comments ─────────────────────────────────────────────────────────────────
// Comments use the unified parentId/parentType model.
// For forum posts, parentType is always 'Post'.

export const getComments = async (req, res, next) => {
  try {
    const postId = req.query.postId || req.params.postId;
    const { page, limit } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    if (!postId) return sendError(res, 400, 'postId required');

    const filter = { parentId: postId, parentType: 'Post', parentCommentId: null };

    const total    = await Comment.countDocuments(filter);
    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name avatar');

    sendResponse(res, 200, true, 'Comments fetched', {
      comments,
      pagination: { total, page: parseInt(page) || 1, limit: limitNum, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) { next(error); }
};

export const createComment = async (req, res, next) => {
  try {
    // postId comes from URL param (nested route) or body
    const postId         = req.params.postId || req.body.postId;
    const { content, parentCommentId } = req.body;

    if (!postId)  return sendError(res, 400, 'postId required');
    if (!content) return sendError(res, 400, 'content required');

    const comment = await Comment.create({
      parentId:        postId,
      parentType:      'Post',
      userId:          req.user.userId,
      content,
      parentCommentId: parentCommentId || null
    });
    await comment.populate('userId', 'name avatar');

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    sendResponse(res, 201, true, 'Comment created', comment);
  } catch (error) { next(error); }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, 404, 'Comment not found');

    if (comment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name avatar');

    sendResponse(res, 200, true, 'Comment updated', updated);
  } catch (error) { next(error); }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, 404, 'Comment not found');

    if (comment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    await Comment.findByIdAndDelete(req.params.id);

    // Decrement parent post's comment count
    if (comment.parentType === 'Post') {
      await Post.findByIdAndUpdate(comment.parentId, { $inc: { commentsCount: -1 } });
    }

    sendResponse(res, 200, true, 'Comment deleted');
  } catch (error) { next(error); }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
    sendResponse(res, 200, true, 'Comment liked', comment);
  } catch (error) { next(error); }
};
