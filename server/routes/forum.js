import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getReplies
} from '../controllers/forumController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Posts - Public read, private write
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id', authMiddleware, updatePost);
router.delete('/posts/:id', authMiddleware, deletePost);

// Comments - Public read, private write
router.get('/posts/:postId/comments', getComments);
router.post('/posts/:postId/comments', authMiddleware, createComment);
router.put('/comments/:id', authMiddleware, updateComment);
router.delete('/comments/:id', authMiddleware, deleteComment);
router.get('/comments/:id/replies', getReplies);

export default router;
